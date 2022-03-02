#CRUD operations
import sqlite3
from flask import g,jsonify

DATABASE_URI = 'twidder/database.db'

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db


def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
        g.db = None

def read_user(email):
    cursor = get_db().execute("select * from user where email like ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    return rows

def get_password(email):
    cursor = get_db().execute("select password from user where email like ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    return rows[0][0]

def create_user(email, password, firstname, familyname, gender, city, country):
    try:
        get_db().execute("insert into user values(?,?,?,?,?,?,?)",
        [email, password, firstname, familyname, gender, city, country])
        get_db().commit()

        return True
    except:
        return False

def create_loggedinuser(token, email):
    try:
        get_db().execute("insert into loggedInUsers values(?,?)", [token,email])
        get_db().commit()
        return True
    except:
        return False

def remove_loggedinuser(token):
    try:
        get_db().execute("delete from loggedInUsers where token = ?",[token])
        get_db().commit()
        return True
    except:
        return False

def tokenToEmail(token):
    try:
        cursor = get_db().execute("select email from loggedInUsers where token = ?", [token])
        rows = cursor.fetchall()
        cursor.close()
        return rows[0][0]
    except:
        return None

def get_user_data_by_email(email):
    try:
        cursor = get_db().execute("select * from user where email = ?", [email])
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except:
        return None

def check_if_loggedin(token):
    try:
        cursor = get_db().execute("select count(1) from loggedInUsers where token = ?",[token])
        rows = cursor.fetchall()
        cursor.close()
        return rows[0][0]
    except:
        return None

def compare_password(oldPassword, token):
    cursor = get_db().execute("select count(1) from user, loggedInUsers where password = ? and token = ?",[oldPassword, token])
    rows = cursor.fetchall()
    cursor.close()
    return rows[0][0]

def change_password(newPassword, token):
     try:
        get_db().execute("update user set password = ? where email = (select email from loggedInUsers where token = ?)", [newPassword, token])
        get_db().commit()
        return True
     except:
         return False

def create_message(fromEmail, toEmail, message):
    try:
        get_db().execute("insert into messages values(?,?,?)", [fromEmail, toEmail, message])
        get_db().commit()
        return True
    except:
        return False

def check_user(email):
    try:
        cursor = get_db().execute("select count(1) from user where email = ?",[email])
        rows = cursor.fetchall()
        cursor.close()
        return rows[0][0]
    except:
        return None

def get_user_message_by_email(email):
    cursor = get_db().execute("select * from messages where toEmail = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    return rows
