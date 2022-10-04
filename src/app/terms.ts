import { Validators } from "remult";

export const terms = {
    username: "שם משתמש",
    signIn: "כניסה",
    confirmPassword: "אשר סיסמה",
    signUp: "הרשמה",
    doesNotMatchPassword: "סיסמאות לא תואמות",
    password: 'סיסמה',
    updateInfo: "עדכון פרטים",
    changePassword: "שנה סיסמה",
    hello: "שלום",
    invalidOperation: "פעולה לא חוקית",
    admin: 'מנהל',
    yes: 'כן',
    no: 'לא',
    ok: 'אישור',
    areYouSureYouWouldLikeToDelete: "אנא אשר פעולת מחיקה",
    cancel: 'ביטול',
    home: 'בית',
    userAccounts: 'משתמשים',
    invalidSignIn: "פרטי כניסה לא תקינים",
    signOut: 'התנתק',
    resetPassword: 'Reset Password',
    passwordDeletedSuccessful: "Password Deleted",
    passwordDeleteConfirmOf: "Are you sure you want to delete the password of",
    rememberOnThisDevice: "Remember on this device?",
    RTL: true
}

Validators.required.defaultMessage = 'ערך חסר';
Validators.unique.defaultMessage = 'קיים כבר ערך זהה'; 