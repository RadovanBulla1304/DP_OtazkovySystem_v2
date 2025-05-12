exports.sk = {
    messages: {
        invalid_credentials: 'Nesprávne prihlasovacie údaje',
        invalid_token: 'Zlý token',
        email_not_found: 'Email sa nenašiel',
        invalid_activation_link: 'Zlý aktivačný link',
        account_activation_success: 'Účet bol aktivovaný.',
        password_change_success: 'Heslo bolo úspešne zmenené',
        database_error: 'Chyba databázy',
        signUp: 'Chyba údajov pri registrácií',
        passwordChange: 'Zmena hesla',
        edit_data_succes: 'Údaje boli úspešne aktualizované',
        singout_error: 'Chyba pri odhlasovaní',
        data_update_error: 'Chyba údajov pri aktualizácií používateľa',
        record_not_exists: 'Záznam neexistuje',
        in: 'Príchod',
        out: 'Odchod',
        error: 'Chyba'
    },

    validation: {
        email_already_exist: 'Zadaný email už existuje',
        empty_password: 'Heslo nemôže byť prázdne',
        empty_identificator: 'Identifikátor je prázdny',
        empty_name: 'Meno je prázdne',
        password_must_contain_min_char: 'Heslo musí mať minimálne 8 znakov',
        password_must_contain_number: 'Heslo musí obsahovať aspoň jedno číslo',
        password_must_contain_lowercase: 'Heslo musí obsahovať aspoň jedno malé písmeno',
        password_must_contain_uppercase: 'Heslo musí obsahovať aspoň jedno veľké písmeno',
        not_boolean: 'Hodnota nie je typu boolean',
        passwords_not_match: 'Heslá sa nezhodujú',
        empty_title: 'Názov je prázdny',
        empty_content: 'Obsah je prázdny',
        invalid_email: 'Email je povinný, alebo ste zadali neplatný email',
        already_exists_record: 'Pre daný deň a osobu už existuje záznam.'
    },
    email: {
        email_send_activate_link: 'Aktivačný link bol odoslaný na váš email',
        email_send_fail: 'Nepodarilo sa odoslať email',
        activation_link_text: 'Účet si aktivujete na nasledujúcom odkaze {{- url}}',
        reset_password_text: 'Heslo si zmeníte na nasledujúcom odkaze {{- url}}',
        email_send_reset_password_link: 'Na email bol odoslaný odkaz na obnovu hesla',
        reset_password: 'Zabudnuté heslo',
        activation_link: 'Aktivačný link'
    }
};
