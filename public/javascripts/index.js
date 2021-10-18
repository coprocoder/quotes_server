
$(document).ready(function(){

    // Проверка авторизации юзера при загрузке страницы
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
            url: '/auth/logout',
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