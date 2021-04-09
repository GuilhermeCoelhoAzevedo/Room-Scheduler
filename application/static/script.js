/***********************************************************************************/
/********************************General functions**********************************/
/***********************************************************************************/
setTimeout(function() {
    $('#flashMessage').fadeOut('fast');
}, 2000); 

/***********************************************************************************/
/********************************Firebase functions*********************************/
/***********************************************************************************/
if(document.getElementById('sign-out')) {
    document.getElementById('sign-out').onclick = function() {
        // ask firebase to sign out the user
        firebase.auth().signOut();
    };
};

var uiConfig = {
    signInSuccessUrl: '/login',
    signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        //CREATE COOKIE WITH THE USER DATA
        user.getIdToken().then(function(token) {
        document.cookie = "token=" + token;
    });
    } else {
        //CREATE LOGIN CONTAINER
        if(document.getElementById('firebase-auth-container')) {
            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            ui.start('#firebase-auth-container', uiConfig);
        }
        document.cookie = "token=";
    }
    }, function(error) {
        alert('Unable to log in: ' + error);
    }
);

/***********************************************************************************/
/********************************Booking functions**********************************/
/***********************************************************************************/
function searchBooking(){
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

            var tblBody = document.createElement("tbody");
            tblBody.setAttribute("id", "booking_tbody");

            $.each(result, function(i, item) {
                //Room
                var row = document.createElement("tr");
                var cell = document.createElement("td");            
                var createLinkTextEdit = document.createTextNode(item[0]);
                cell.appendChild(createLinkTextEdit);

                row.appendChild(cell);

                //Name
                cell = document.createElement("td");
                createLinkTextEdit = document.createTextNode(item[1]);
                cell.appendChild(createLinkTextEdit);

                row.appendChild(cell);
                
                //Dt. start
                cell = document.createElement("td");
                createLinkTextEdit = document.createTextNode(item[2]);
                cell.appendChild(createLinkTextEdit);

                row.appendChild(cell);
                
                //Dt. finish
                cell = document.createElement("td");
                createLinkTextEdit = document.createTextNode(item[3]);
                cell.appendChild(createLinkTextEdit);

                row.appendChild(cell);

                //Booking Owner
                cell = document.createElement("td");
                createLinkTextEdit = document.createTextNode(item[5]);
                cell.appendChild(createLinkTextEdit);

                row.appendChild(cell);

                //Buttons
                cell = document.createElement("td");
                cell.setAttribute("align", "right");
                
                if(item[6]){
                    //Edit booking button
                    var url_button = 'editBooking/' + item[4];
                    var createLink = document.createElement("a");
                    createLinkTextEdit = document.createTextNode("Edit Booking");
                    createLink.setAttribute('class', 'btn btn-dark');
                    createLink.setAttribute('href', url_button);
                    createLink.appendChild(createLinkTextEdit);
                    cell.appendChild(createLink);

                    //Delete booking button
                    url_button = 'deleteBooking/' + item[4];
                    createLink = document.createElement("a");
                    createLinkTextEdit = document.createTextNode("Delete Booking");
                    createLink.setAttribute('class', 'btn btn-danger');
                    createLink.setAttribute('href', url_button);
                    createLink.appendChild(createLinkTextEdit);
                    cell.appendChild(createLink);
                }
                row.appendChild(cell);
                tblBody.appendChild(row);
            });

            document.getElementById('booking_tbody').replaceWith(tblBody);
        },
        
        error: function (event, jqxhr, settings, thrownError) {
            alert('Error to filter data. Please try again!');
        }
    });
};

