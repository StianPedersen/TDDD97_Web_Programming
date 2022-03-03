from flask import Flask, jsonify, request, make_response, render_template
from flask_sock import Sock
import data_handler
import random

#from twidder import app


app = Flask(__name__)
sock = Sock(app)
sockets = []

@app.teardown_request
def after_request(exception):
    data_handler.disconnect_db()

@app.route("/")
def root():
    return render_template("client.html")


@sock.route('/echo')
def echo(sock):
    token = sock.receive()
    email = data_handler.tokenToEmail(token)

    if email in sockets:
         sock.send('Logout')
         sock.close()
    else:
        sockets.append({'sock' : sock, 'email' : email})
        sock.send('Socket has been saved')
    while True:
        data = sock.receive()
        sock.send(data)


@app.route('/user/post/signIn', methods = ['POST'])
def signIn():
    json=request.get_json()
    if "Email" in json and "Password" in json:
            db_pass = data_handler.get_password(json["Email"])
            if db_pass == json["Password"]:
                letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
                token = "";
                for i in range(36):
                    token += letters[random.randint(0,len(letters)-1)]
                if(data_handler.create_loggedinuser(token, json["Email"])):
                    response = make_response();
                    response.headers["Authorization"] = token
                    return response, 201 ## Skicka token via Authorization i lab 3
                else:
                    return "{}", 500
            else:
                return "{}", 401 #AUTHENTICATION
    else:
        return "{}", 400 #AUTHENTICATION?

@app.route('/user/put/signUp', methods = ['PUT'])
def signUp():
    json=request.get_json()
    if ("email" in json and
        "password" in json and
        "firstname" in json and
        "familyname" in json and
        "gender" in json and
        "city" in json and
        "country" in json):
        if (len(json['password']) > 2 and
            len(json['password']) < 100 and
            len(json['firstname']) < 100 and
            len(json['familyname']) < 100 and
            len(json['gender']) < 100 and
            len(json['city']) < 100 and
            len(json['country']) < 100 and
            len(json['email']) < 100):
                result = data_handler.create_user(json['email'], json['password'],
                json['firstname'], json['familyname'], json['gender'],
                json['city'], json['country'])
                if result:
                    return "{}", 201
                else:
                    return "{}", 500
        else:
            return "{}", 401

    else:
        return "{}", 402

@app.route('/user/put/signOut', methods = ['PUT'])
def signOut():
    token=request.headers.get('Authorization')
    if data_handler.check_if_loggedin(token):
        if data_handler.remove_loggedinuser(token):
            return "{}", 200
        else:
            return "{}", 500
    else:
        return "{}", 401

@app.route('/user/get/get_user_data_by_token', methods = ['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    email = data_handler.tokenToEmail(token)
    return get_user_data_by_email(email)

@app.route('/user/get/get_user_data_by_email/<email>', methods = ['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('Authorization')
    if data_handler.check_if_loggedin(token):
        result = data_handler.get_user_data_by_email(email) #email
        if result:
            response = make_response(jsonify(
            {'email' : result[0][0],
            'name' : result[0][2],
            'familyname' : result[0][3],
            'gender' : result[0][4],
            'city' : result[0][5],
            'country' : result[0][6]}))
            response.headers['Content-Type']='application/json'
            return response, 200
        else:
            return "{}", 400
    else:
        return "{}", 401

@app.route('/user/put/change_password', methods = ['PUT'])
def change_password():
    token = request.headers.get('Authorization')
    if data_handler.check_if_loggedin(token):
        json=request.get_json()
        if data_handler.compare_password(json['oldPassword'], token):
            if data_handler.change_password(json['newPassword'], token):
                return "{}", 200
            else:
                return  "{}", 500
        return "{}", 400
    return "{}", 401

@app.route('/user/post/post_message', methods = ['POST'])
def post_message():
    token=request.headers.get('Authorization')
    if data_handler.check_if_loggedin(token):
        json=request.get_json()
        if json['toEmail'] is None:
            json['toEmail'] = data_handler.tokenToEmail(token)

        if "toEmail" in json and "message" in json:
            if (len(json['toEmail']) <= 100 and
                len(json['message']) <= 200 and
                len(json['message']) > 0):
                fromEmail = data_handler.tokenToEmail(token)

                if data_handler.check_user(json['toEmail']):
                    data_handler.create_message(fromEmail, json['toEmail'], json['message'])
                    return "{}", 200
                else:
                    return "{}", 404
            else:
                return "{}", 400
        else:
            return "{}", 402
    else:
        return "{}", 401

@app.route('/user/get/get_user_message_by_token', methods = ['GET'])
def get_user_message_by_token():
    token=request.headers.get('Authorization')
    email = data_handler.tokenToEmail(token)
    return get_user_message_by_email(email)

@app.route('/user/get/get_user_message_by_email/<email>', methods = ['GET'])
def get_user_message_by_email(email):
    token=request.headers.get('Authorization')
    if data_handler.check_if_loggedin(token):
        rows = data_handler.get_user_message_by_email(email)
        result = []
        for row in rows:
            result.append({"From" : row[0], "To" : row[1], "msg" : row[2]})
        if len(result) > 0:
            return jsonify(result), 200
        else:
            return "{}", 400
    else:
        return "{}", 401


# def run_server():
#     app.debug = True
#     http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
#     http_server.serve_forever()

if __name__ =='__main__':
    app.debug = True
    app.run()
