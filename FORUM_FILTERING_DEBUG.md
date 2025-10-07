# Forum Filtering Debug Guide

## Changes Made

### Backend (`forumController.js`)

1. **Fixed enrichForumQuestions usage**: Removed the `.populate()` calls and now using the `enrichForumQuestions()` function to properly populate author and module data.

2. **Added console logging** to debug filter values:
   - Logs when filtering by `modul`
   - Logs when filtering by `tags`
   - Logs when filtering by `search`
   - Logs when filtering by `createdByModel`
   - Logs final filter object and sortBy value

### Frontend (`Forum.jsx`)

1. **Added console logging** to see what query parameters are being sent to the backend

## How to Test

### 1. Open Browser Console (F12)

### 2. Test Module Filtering
1. Go to Forum page
2. Select a module from the dropdown
3. Check console logs:
   - **Frontend**: Should see `Forum query params: { page: 1, limit: 10, modul: "...", sortBy: "likes" }`
   - **Backend terminal**: Should see `Filtering by modul: ...` and `Final filter: {...}`

### 3. Test Sort Filtering
1. Change "Zoradiť podľa" dropdown to different values:
   - Najobľúbenejšie (likes)
   - Najnegatívnejšie (dislikes)
   - Najpopulárnejšie (popular)
   - Najviac komentárov (comments)
   - Najnovšie (newest)
   - Najstaršie (oldest)
2. Check console logs for `Sort by: ...`
3. Verify questions reorder correctly

### 4. Test Tag Filtering
1. Click on some tags in the "Filtrovať podľa tagov" section
2. Check console logs for `Filtering by tags: [...]`

### 5. Test Search
1. Type in search box
2. Check console logs for `Filtering by search: ...`

### 6. Test Author Type Filter
1. Select "Anonymní používatelia" or "Učitelia"
2. Check console logs for `Filtering by createdByModel: ...`

## Expected Backend Behavior

### Filter Object Examples:

**Module filter:**
```json
{
  "modul": "68d24d08fc42cf5c9cea27d1"
}
```

**Sort by likes:**
```json
sortObj = {
  "is_pinned": -1,
  "likes_count": -1,
  "createdAt": -1
}
```

**Sort by dislikes:**
```json
sortObj = {
  "is_pinned": -1,
  "dislikes_count": -1,
  "createdAt": -1
}
```

**Sort by comments:**
```json
sortObj = {
  "is_pinned": -1,
  "comments_count": -1,
  "createdAt": -1
}
```

**Sort by newest:**
```json
sortObj = {
  "is_pinned": -1,
  "createdAt": -1
}
```

**Sort by oldest:**
```json
sortObj = {
  "is_pinned": -1,
  "createdAt": 1
}
```

## Common Issues to Check

### Issue 1: Module filter not working
**Possible causes:**
- Module ID format mismatch (string vs ObjectId)
- Module field in database is null
- Module ID doesn't exist in database

**Solution:** Check backend logs for the filter object. If modul is there, check MongoDB to verify the modul field format.

### Issue 2: Sort not working
**Possible causes:**
- `likes_count`, `dislikes_count`, or `comments_count` fields are missing in database
- These fields need to be calculated/updated

**Solution:** Check if documents have these fields:
```javascript
db.forumquestions.findOne({}, { likes_count: 1, dislikes_count: 1, comments_count: 1 })
```

### Issue 3: Tags filter not working
**Possible causes:**
- Tags are stored differently than expected (string vs array)
- Case sensitivity issues

**Solution:** Check backend logs and verify tags field structure in MongoDB.

## Database Schema Check

Run this in MongoDB shell to verify schema:
```javascript
// Check one forum question structure
db.forumquestions.findOne()

// Check if counts exist
db.forumquestions.aggregate([
  { $match: {} },
  { $project: {
      header: 1,
      modul: 1,
      likes_count: 1,
      dislikes_count: 1,
      comments_count: 1
    }
  },
  { $limit: 5 }
])
```

## Next Steps

1. Test each filter type individually
2. Check both frontend console and backend terminal logs
3. Verify data structure in MongoDB
4. If a specific filter isn't working, the logs will show:
   - What's being sent from frontend
   - What filter is being applied on backend
   - This will help identify where the issue is

## Remove Debug Logs (After Fixing)

Once filtering is working, remove the console.log statements:
- Lines in `forumController.js` that start with `console.log('Filtering...`
- Line in `Forum.jsx` with `console.log('Forum query params:'...`
