
$(document).ready(function(){

    // Проверка авторизации юзера при загрузке страницы
    var login_btn = $('<a id="login_btn">Login</a>');
    var logout_btn = $('<a id="logout_btn">Logout</a>');
    if($('#userdata').attr('user') == ''){
        $('#login_btn').css({'display':'block'});
        $('#logout_btn').css({'display':'none'});
    } else {
        $('#login_btn').css({'display':'none'});
        $('#logout_btn').css({'display':'block'});
    }

    // Авторизация
    $('#login_btn').on('click', function(){
        $('#login_form_div').css({'display':'block'})
    })

    $('#logout_btn').on('click', function(){
        $.ajax({
            url: '/logout',
            method: 'post',
            success: function(response){
                console.log('logout', response)
                alert('You are logged out')
                window.location.href = '/'
            },
            error: function(response){
                console.log('error', response)
                alert('Oops... Something is wrong')
            }
        })
    })

    // Регистрация
    $('#register_btn').on('click', function(){
        $('#login_form_div').css({'display':'none'})
        $('#register_form_div').css({'display':'block'})
    })
});