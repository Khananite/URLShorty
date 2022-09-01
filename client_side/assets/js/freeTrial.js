function freeTrial()
{
    //Cookie to pass to urlShorty page so the user can be redirected back to
    //index.html after 60 minutes.
    document.cookie = 1;
    window.location = "urlShorty.html";
    alert("You have 60 minutes free trial");
}