displayView = function() {
  // the code required to display a view
  var myDiv = document.getElementById("myDivId");
  var myScript;
  var token=localStorage.getItem("token");
  if(token)
  {
    myScript = document.getElementById("ProfileScript");
    myDiv.innerHTML = myScript.innerHTML;
    printInfo(null, 'personalInfo');
    printWall(null, 'messageinfo');
  }
  else {
    myScript = document.getElementById("WelcomeScript");
    myDiv.innerHTML = myScript.innerHTML;
  }
};

window.onload = function() {
  displayView();
};

function connect_socket()
{
  console.log("trying to connect");
  var connection = new WebSocket("ws://"+ document.domain + ":5000/echo");

  connection.onopen = function()
  {
    console.log('connection open');
    token = localStorage.getItem('token');
    connection.send(token);
  };

  connection.onmessage = function(e)
  {
    console.log('Server: ' + e.data);
    if(e.data == 'Logout')
    {
      localStorage.removeItem('token');
      displayView();
    }
  };

  connection.onclose = function()
  {
    console.log("Successfully closed connection!");
  };
    connection.onerror = function(event){
    console.log("Error in websocket",event);
  };
};

function passwordCheck(password1, password2) {
  if(password1.value != password2.value)
  {
    password2.setCustomValidity('Passwords must match');
    return false;
  }
  else {
   password2.setCustomValidity('');
   return true;
  }
}

function sendMessage(msg, email, div_id){
  let div=document.getElementById(div_id);

  let request = new XMLHttpRequest();
  request.open("POST", "/user/post/post_message", true);
  request.setRequestHeader('Authorization', localStorage.getItem('token'));
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  let messages = {
    toEmail: null,
    message: msg.value
  }
  if (email != null){
    messages.toEmail = email.value;
  }
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 200)
      {
          document.getElementById("output").innerHTML = "<h3>Message posted!</h3>"
          document.getElementById("searchmsg").value='';
          document.getElementById("msg").value='';
          printWall(messages.toEmail, div_id);
      }
      else if(request.status == 400)
      {
        document.getElementById("output").innerHTML = "<h3>Incorrect message or toemail data!</h3>"
      }
      else if(request.status == 401)
      {
        document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"

      }
      else if(request.status == 404)
      {
        document.getElementById("output").innerHTML = "<h3>No such user!</h3>"
      }
    }

  }
  request.send(JSON.stringify(messages));
}

function searchUser(email, div_id, div_id2){

  let request = new XMLHttpRequest();
  request.open("GET", "/user/get/get_user_data_by_email/" + email.value, true);
  request.setRequestHeader('Authorization', localStorage.getItem('token'));

    request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 200){
        printInfo(email.value, div_id);
        printWall(email.value, div_id2);
        document.getElementById("output").innerHTML = ""
      }
      else if(request.status == 400){
        document.getElementById("output").innerHTML = "<h3>No such user!</h3>"
      }
      else if(request.status == 401){
        document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"
      }
      else if(request.status == 500){
        document.getElementById("output").innerHTML = "<h3>Ops! Something serious went wrong!</h3>"
      }
    }
  }
  request.send(null);
}

function openTab(evt, tabName){
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for(i=0; i<tabcontent.length; i++)
  {
    tabcontent[i].style.display="none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  document.getElementById("output").innerHTML = ""
}

function logOut(){

 let request = new XMLHttpRequest();
 request.open("PUT", "/user/put/signOut", true);
 request.setRequestHeader('Authorization', localStorage.getItem('token'));
 request.onreadystatechange = function(){
   if(request.readyState == 4){
     if(request.status == 200){
       localStorage.removeItem('token');
       displayView();
     }
     else if(request.status == 401){
       document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"
     }
     else if(request.status == 500){
       document.getElementById("output").innerHTML = "<h3>Ops! Something serious went wrong!</h3>"
     }
   }
 }
 request.send(null);
}

signUpValidation = function(DataObject){
  if(DataObject.password1.value == DataObject.password2.value)
  {
    let user = {
      email: DataObject.sign_up_email.value,
      password: DataObject.password1.value,
      firstname: DataObject.firstname.value,
      familyname: DataObject.familyname.value,
      gender: DataObject.gender.value,
      city: DataObject.city.value,
      country: DataObject.country.value
    }
    let request = new XMLHttpRequest();
    request.open("PUT", "/user/put/signUp", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    request.onreadystatechange = function(){
      if(request.readyState == 4){
        if(request.status == 201){
          token = request.getResponseHeader('Authorization');
          localStorage.setItem("token", token);
          signInValidation(DataObject.sign_up_email, DataObject.password1);
        }
        else if(request.status == 400){
          document.getElementById("output").innerHTML = "<h3>Ops!!</h3>"
        }
        else if(request.status == 401){
          document.getElementById("output").innerHTML = "<h3>Wrong format!</h3>"
        }
        else if(request.status == 402){
          document.getElementById("output").innerHTML = "<h3>Missing value!</h3>"
        }
        else if(request.status == 500){
          document.getElementById("output").innerHTML = "<h3>Ops! Something serious went wrong!</h3>"
        }
      }

    }
    request.send(JSON.stringify(user));
}
}

recoverPassword = function(email){
  let request = new XMLHttpRequest();
  request.open("POST", "/sendLink", true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  let data = {
    Email: email.value
  }
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 200)
      {
        document.getElementById("front_pic").innerHTML = "<h3>You have recieved an recovery email</h3>"
      }
      else if(request.status == 400)
      {
        document.getElementById("front_pic").innerHTML = "<h3>User does not exist!</h3>"
      }
      else if(request.status == 404)
      {
        document.getElementById("front_pic").innerHTML = "<h3>need email!</h3>"
      }
      else if(request.status == 500)
      {
        document.getElementById("front_pic").innerHTML = "<h3>Something serious went wrong!</h3>"
      }
    }
  }
  request.send(JSON.stringify(data));
}

signInValidation = function(email, password){
  let request = new XMLHttpRequest();
  request.open("POST", "/user/post/signIn" , true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  let credentials = {
    Email: email.value,
    Password: password.value
  }
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 201){
        token = request.getResponseHeader('Authorization');
        localStorage.setItem("token", token);
        connect_socket();
        displayView();
      }
      else if(request.status == 400){
        document.getElementById("front_pic").innerHTML = "<h3>Email or password is missing!</h3>"
      }
      else if(request.status == 401){
        document.getElementById("front_pic").innerHTML = "<h3>Wrong email or password!</h3>"
      }

      else if(request.status == 500){
        document.getElementById("front_pic").innerHTML = "<h3>Ops! Something serious went wrong!</h3>"
      }
    }
  }
  request.send(JSON.stringify(credentials));
}

changePassword = function(oldPassword,newPassword1,newPassword2){

    if(newPassword1.value != newPassword2.value)
    {
      document.getElementById("output").innerHTML = "<h3>Passwords does not match!</h3>";
    }
    else {
      let request = new XMLHttpRequest();
      request.open("PUT", "/user/put/change_password", true);
      request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      request.setRequestHeader('Authorization', localStorage.getItem('token'));
      let password_change = {
        oldPassword: oldPassword.value,
        newPassword: newPassword1.value
      }

      request.onreadystatechange = function(){
        if(request.readyState == 4){
          if(request.status == 200)
          {
            document.getElementById("output").innerHTML = "<h3>Password changed!</h3>"
          }
          else if(request.status == 400)
          {
            document.getElementById("output").innerHTML = "<h3>Wrong password!</h3>"
          }
          else if(request.status == 401)
          {
            document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"
          }
          else if(request.status == 500)
          {
            document.getElementById("output").innerHTML = "<h3>Internal server error!</h3>"
          }

        }

      }
      request.send(JSON.stringify(password_change));
    }
}


printInfo = function(email, div_id){
  let div=document.getElementById(div_id);
  let request = new XMLHttpRequest();
  if(email == null)
  {
    request.open("GET", "/user/get/get_user_data_by_token", true);
  }
  else
  {
    request.open("GET", "/user/get/get_user_data_by_email/" + email, true);
  }
  request.setRequestHeader('Authorization', localStorage.getItem('token'));
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 200)
      {
        result = JSON.parse(request.response);
        div.innerHTML = "Email: " + result.email +
        "<br/>Name: " + result.name  + " " + result.familyname +
        "<br/>City: " + result.city +
        "<br/>Country: " + result.country +
        "<br/>Gender: " + result.gender;
        document.getElementById("output").innerHTML = ""
      }
      else if(request.status == 400)
      {
        document.getElementById("output").innerHTML = "<h3>User does not exist!</h3>"
      }
      else if(request.status == 401)
      {
        document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"
      }
    }

  }
  request.send(null);
}

printWall = function(email, div_id){
  let div=document.getElementById(div_id);
  div.innerHTML = "";
  var token = localStorage.getItem("token");
  let request = new XMLHttpRequest();
  if(email == null)
  {
    request.open("GET", "/user/get/get_user_message_by_token", true);
  }
  else
  {
    request.open("GET", "/user/get/get_user_message_by_email/" + email, true);
  }
  request.setRequestHeader('Authorization', localStorage.getItem('token'));
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      if(request.status == 200)
      {
        result = JSON.parse(request.response);
        let output = "";
        result.forEach(function(c){
          output = output + "<h4>From: " +c.From + " message: " + c.msg +"</h4>";
        })
        div.innerHTML = output;
        document.getElementById("output").innerHTML = ""
      }
      else if(request.status == 401)
      {
        document.getElementById("output").innerHTML = "<h3>You are not signed in!</h3>"
      }
    }
  }
  request.send(null);
}


function allowDrop(ev) {
  ev.preventDefault();

}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  var nodeCopy = document.getElementById(data).cloneNode(true);
  var node = document.getElementById("front_pic");
  if(node.hasChildNodes())
  {
    while(node.firstChild){
      node.removeChild(node.lastChild);
    }
  }
  nodeCopy.id = "newId";
  node.appendChild(nodeCopy);
}
