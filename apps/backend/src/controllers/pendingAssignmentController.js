const PendingSubjectAssignment = require("../models/pendingSubjectAssignment")
const Subject = require("../models/subject")
const User = require("../models/user")
const { throwError } = require("../util/universal")

/**
 * Save pending subject assignments for students not yet registered.
 * Called from CSV import when unmatched student numbers are found.
 *
 * Body: { subjectId, students: [{ studentNumber, name, surname, group }] }
 */
exports.createPendingAssignments = [
    async (req, res) => {
        try {
            const { subjectId, students } = req.body

            if (!subjectId || !students || !Array.isArray(students) || students.length === 0) {
                return res.status(400).json({
                    message: "subjectId a pole students sú povinné.",
                })
            }

            // Verify subject exists
            const subject = await Subject.findById(subjectId)
            if (!subject) {
                return res.status(404).json({
                    message: "Predmet nebol nájdený.",
                })
            }

            const teacherId = req.user.user_id

            // Default expiry: 6 months from now
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + 6)

            const results = { created: 0, duplicates: 0, errors: [] }

            for (const student of students) {
                if (!student.studentNumber) {
                    results.errors.push(`Chýba študentské číslo pre ${student.surname || "neznámy"}`)
                    continue
                }

                try {
                    // Check if there's already a registered user with this studentNumber
                    const existingUser = await User.findOne({
                        studentNumber: Number(student.studentNumber),
                    })

                    if (existingUser) {
                        // User exists — skip, they should be assigned directly
                        results.errors.push(
                            `Študent ${student.studentNumber} (${student.surname}) je už registrovaný — použite priame priradenie.`,
                        )
                        continue
                    }

                    await PendingSubjectAssignment.findOneAndUpdate(
                        {
                            studentNumber: Number(student.studentNumber),
                            subject: subjectId,
                        },
                        {
                            studentNumber: Number(student.studentNumber),
                            subject: subjectId,
                            createdBy: teacherId,
                            expiresAt,
                            csvName: student.name || "",
                            csvSurname: student.surname || "",
                            csvGroup: student.group || "",
                        },
                        { upsert: true, new: true },
                    )
                    results.created++
                } catch (err) {
                    if (err.code === 11000) {
                        results.duplicates++
                    } else {
                        results.errors.push(
                            `Chyba pre študenta ${student.studentNumber}: ${err.message}`,
                        )
                    }
                }
            }

            res.status(200).json({
                message: `Uložených ${results.created} čakajúcich priradení.${results.duplicates > 0 ? ` ${results.duplicates} duplicitných preskočených.` : ""}`,
                results,
            })
        } catch (err) {
            throwError(`Chyba databázy: ${err.message}`, 500)
        }
    },
]

/**
 * Get all pending assignments for a subject.
 */
exports.getPendingAssignments = [
    async (req, res) => {
        try {
            const { subjectId } = req.params

            if (!subjectId) {
                return res.status(400).json({ message: "subjectId je povinný." })
            }

            const pending = await PendingSubjectAssignment.find({ subject: subjectId })
                .populate("subject", "name code")
                .populate("createdBy", "name surname email")
                .sort({ createdAt: -1 })

            res.status(200).json(pending)
        } catch (err) {
            throwError(`Chyba databázy: ${err.message}`, 500)
        }
    },
]

/**
 * Delete a specific pending assignment.
 */
exports.deletePendingAssignment = [
    async (req, res) => {
        try {
            const { id } = req.params

            const deleted = await PendingSubjectAssignment.findByIdAndDelete(id)
            if (!deleted) {
                return res.status(404).json({ message: "Čakajúce priradenie nebolo nájdené." })
            }

            res.status(200).json({ message: "Čakajúce priradenie bolo zmazané." })
        } catch (err) {
            throwError(`Chyba databázy: ${err.message}`, 500)
        }
    },
]

/**
 * Delete all pending assignments for a subject.
 */
exports.deleteAllPendingAssignments = [
    async (req, res) => {
        try {
            const { subjectId } = req.params

            const result = await PendingSubjectAssignment.deleteMany({ subject: subjectId })

            res.status(200).json({
                message: `Zmazaných ${result.deletedCount} čakajúcich priradení.`,
                deletedCount: result.deletedCount,
            })
        } catch (err) {
            throwError(`Chyba databázy: ${err.message}`, 500)
        }
    },
]

/**
 * Resolve pending assignments for a user (called after email confirmation).
 * Finds all pending assignments matching user's studentNumber, assigns user
 * to those subjects, and removes the pending records.
 *
 * @param {Number} studentNumber - the student's number
 * @param {String} userId - the user's _id
 * @returns {Object} - { assignedSubjects: string[], count: number }
 */
exports.resolvePendingAssignments = async (studentNumber, userId) => {
    const pending = await PendingSubjectAssignment.find({
        studentNumber: Number(studentNumber),
    }).populate("subject", "name code")

    if (!pending || pending.length === 0) {
        return { assignedSubjects: [], count: 0 }
    }

    const assignedSubjects = []

    for (const record of pending) {
        try {
            const subject = await Subject.findById(record.subject._id || record.subject)
            if (!subject) continue

            // Add user to subject's assigned_students
            if (!Array.isArray(subject.assigned_students)) {
                subject.assigned_students = []
            }
            if (!subject.assigned_students.map(String).includes(String(userId))) {
                subject.assigned_students.push(userId)
                await subject.save()
            }

            // Add subject to user's assignedSubjects
            const user = await User.findById(userId)
            if (user) {
                if (!Array.isArray(user.assignedSubjects)) {
                    user.assignedSubjects = []
                }
                if (!user.assignedSubjects.map(String).includes(String(subject._id))) {
                    user.assignedSubjects.push(subject._id)
                    await user.save()
                }
            }

            assignedSubjects.push(subject.name || subject.code)

            // Remove the fulfilled pending assignment
            await PendingSubjectAssignment.findByIdAndDelete(record._id)
        } catch (err) {
            console.error(
                `Error resolving pending assignment ${record._id}: ${err.message}`,
            )
        }
    }

    return { assignedSubjects, count: assignedSubjects.length }
}
