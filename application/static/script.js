/***********************************************************************************/
/********************************General functions**********************************/
/***********************************************************************************/

setTimeout(function() {
    $('.alert').fadeOut('fast');
}, 3000); 

/***********************************************************************************/
/********************************Firebase functions*********************************/
/***********************************************************************************/

if(document.getElementById('sign-out')) {
    document.getElementById('sign-out').onclick = function() {
        // ask firebase to sign out the user
        firebase.auth().signOut();
    };
};

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
    initializeAuth();
});

var uiConfig = {
    signInSuccessUrl: '/login',
    signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

function initializeAuth(){
    firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
            //CREATE COOKIE WITH THE USER DATA
            user.getIdToken().then(function(token) {
                document.cookie = "token=" + token + ";domain=;path=/";
            });
        } else {
            //CREATE LOGIN CONTAINER
            if(document.getElementById('firebase-auth-container')) {
                var ui = new firebaseui.auth.AuthUI(firebase.auth());
                ui.start('#firebase-auth-container', uiConfig);
            }
            document.cookie = "token=" + ";domain=;path=/";
        }
        }, function(error) {
            alert('Unable to log in: ' + error);
        }
    );
};

/***********************************************************************************/
/********************************Booking functions**********************************/
/***********************************************************************************/

//CALL FILTER FUNCTION WHEN THE USER COMES BACK FROM A PAGE
window.addEventListener("pageshow", () => {
    if(document.getElementsByClassName('filter-flex-div')){
        searchBooking();
    }
});

function searchBooking(){
    if(! document.getElementById('userBookings')){
        return false;
    };
    
    var room_number     = document.getElementById('room_number').value;
    var dt_start        = document.getElementById('dt_start').value;
    var dt_finish       = document.getElementById('dt_finish').value;
    var user_bookings   = document.getElementById('userBookings').checked;

    var filters = {
        room_number: room_number,
        dt_start: dt_start,
        dt_finish: dt_finish,
        user_bookings: user_bookings
    };

    const post_filters = JSON.stringify(filters);

    $.ajax({
        url: '/bookings',
        type: 'POST',
        data: post_filters,
        dataType: 'json',
        contentType: 'application/json',
        success: function (result, status, request) {
            $("#booking_tbody").html("");
            $.each(result, function(i, item) {
                var_body = '<tr>';
                var_body += '<td>' + item[0] + '</td>';
                var_body += '<td>' + item[1] + '</td>';
                var_body += '<td>' + item[2] + '</td>';
                var_body += '<td>' + item[3] + '</td>';
                var_body += '<td>' + item[5] + '</td>';
            
                if(item[6]){
                    var_body += '<td>';
                    
                    //EDIT BUTTON
                    var button = '<div class="container-flex">' +
                                    '<a class="btn btn-dark" href="editBooking/' + item[4] +  '">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
                                            '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
                                        '</svg>' +
                                        'Edit Booking' +
                                    '</a>'
                    var_body+=button

                    //DELETE BUTTON
                    button = '<form class="deleteBooking" action="\deleteBooking" onclick="return confirmDelete(this);" method="POST">' +
                                '<input type="hidden" name="csrf_token" value="' + csrf_token + '"/>' +
                                '<input type="hidden" name="id" value="' + item[4] + '"/>' +
                                '<a class="btn btn-danger">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
                                        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>' +
                                        '<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>' +
                                    '</svg>' +
                                    'Delete Booking' +
                                '</a>' +
                            '</form>'
                    var_body+=button
                    
                    var_body += '</td>';
                }else{
                    var_body += '<td></td>';
                };
    
                var_body += '</tr>';
                $("#booking_tbody").append(var_body);
            });
            
        },

        error: function (event, jqxhr, settings, thrownError) {
            alert('Error to filter data. Please try again!');
        }
    });
};

/***********************************************************************************/
/********************************MODAL FORM functions*******************************/
/***********************************************************************************/

$(document).ready(function(e) {
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: true,
        show: false,
    });
});

var form_action;

function confirmDelete(form){
    form_action = form;

    if(form_action.className == 'deleteRoom'){
        //TITLE
        $("#myModalLabel").text("Delete room?");
        //BODY
        $(".modal-body").html("<p>Are you sure do you want to delete the room <b>" + form_action.id.value + " - " + form_action.name.value + "</b>? </p>");
    }else{
        //TITLE
        $("#myModalLabel").text("Delete booking?");
        //BODY
        $(".modal-body").html("<p>Are you sure do you want to delete this booking?</p>");
    };

    //FOOTER
    $("#modal-action").text("Confirm");
    $("#modal-action").attr("class", "btn btn-danger");
    $("#modal-action").attr("onclick", "form_action.submit()");

    $('#myModal').modal('show');
};