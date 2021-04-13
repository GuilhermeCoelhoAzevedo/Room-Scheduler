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

/***********************************************************************************/
/********************************Booking functions**********************************/
/***********************************************************************************/
window.addEventListener("pageshow", () => {
    if(document.getElementsByClassName('filter-flex-div')){
        searchBooking();
    }
});

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

                //BUTTONS
                cell = document.createElement("td");
                cell.setAttribute("align", "right");
                
                if(item[6]){
                    var div_button = document.createElement("div");
                    div_button.setAttribute('class', 'container-flex')
                    
                    //EDIT BOOKING BUTTON
                    var url_button = 'editBooking/' + item[4];
                    var createLink = document.createElement("a");
                    createLinkTextEdit = document.createTextNode("Edit Booking");
                    createLink.setAttribute('class', 'btn btn-dark');
                    createLink.setAttribute('href', url_button);

                    //CREATE ICON OF EDIT BUTTON
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttributeNS(null, "width", '16');
                    svg.setAttributeNS(null, "height", '16');
                    svg.setAttributeNS(null, "fill", 'currentColor');
                    svg.setAttributeNS(null, "class", 'bi bi-pencil');
                    svg.setAttributeNS(null, "viewBox", '0 0 16 16');
    
                    var use = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    use.setAttributeNS(null, 'd', 'M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z');
                    svg.appendChild(use);
                
                    //APPEND CHILD
                    createLink.appendChild(svg);
                    createLink.appendChild(createLinkTextEdit);
                    div_button.appendChild(createLink);

                    //DELETE BOOKING BUTTON
                    url_button = 'deleteBooking/' + item[4];
                    createLink = document.createElement("a");
                    createLinkTextEdit = document.createTextNode("Delete Booking");
                    createLink.setAttribute('class', 'btn btn-danger');
                    createLink.setAttribute('href', url_button);
                    createLink.appendChild(createLinkTextEdit);
                    div_button.appendChild(createLink);

                    //CREATE ICON OF DELETE BUTTON
                    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttributeNS(null, "width", '16');
                    svg.setAttributeNS(null, "height", '16');
                    svg.setAttributeNS(null, "fill", 'currentColor');
                    svg.setAttributeNS(null, "class", 'bi bi-trash');
                    svg.setAttributeNS(null, "viewBox", '0 0 16 16');
    
                    use = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    use.setAttributeNS(null, 'd', 'M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z');
                    svg.appendChild(use);
                    
                    use = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    use.setAttributeNS(null, 'fill-rule', 'evenodd');
                    use.setAttributeNS(null, 'd', 'M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z');
                    svg.appendChild(use);

                    //APPEND CHILD
                    createLink.appendChild(svg);
                    createLink.appendChild(createLinkTextEdit);
                    div_button.appendChild(createLink);

                    cell.appendChild(div_button);
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

