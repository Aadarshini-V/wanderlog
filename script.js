/* =====================================================
   WANDERLOG
   Trip CRUD Application
   JavaScript + DOM + localStorage
   ===================================================== */


/* ================= STORAGE KEY ================= */

const STORAGE_KEY = "wanderlogTrips";


/* ================= DOM ELEMENTS ================= */

const tripForm = document.getElementById("trip-form");

const tripTitle = document.getElementById("trip-title");

const tripDestination =
    document.getElementById("trip-destination");

const tripDate =
    document.getElementById("trip-date");

const tripImage =
    document.getElementById("trip-image");

const tripNotes =
    document.getElementById("trip-notes");

const tripList =
    document.getElementById("trip-list");

const emptyMessage =
    document.getElementById("empty-message");

const formMessage =
    document.getElementById("form-message");

const formHeading =
    document.getElementById("form-heading");

const submitBtn =
    document.getElementById("submit-btn");

const cancelBtn =
    document.getElementById("cancel-btn");


/* ================= EDIT STATE ================= */

/*
    null  = adding a new trip

    trip ID = editing an existing trip
*/

let editingTripId = null;


/* =====================================================
   READ TRIPS FROM LOCAL STORAGE
   ===================================================== */

function getTrips() {

    const storedTrips =
        localStorage.getItem(STORAGE_KEY);

    if (!storedTrips) {
        return [];
    }

    try {

        const trips = JSON.parse(storedTrips);

        if (Array.isArray(trips)) {
            return trips;
        }

        return [];

    } catch (error) {

        console.error(
            "Error reading trips from localStorage:",
            error
        );

        return [];
    }
}


/* =====================================================
   SAVE TRIPS TO LOCAL STORAGE
   ===================================================== */

function saveTrips(trips) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(trips)
    );
}


/* =====================================================
   CREATE UNIQUE ID
   ===================================================== */

function createTripId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8);
}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

/*
    This prevents user-entered text from being treated
    as HTML when trip cards are created.
*/

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "Date not available";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* =====================================================
   SHOW FORM MESSAGE
   ===================================================== */

function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className = type;

}


/* =====================================================
   HIDE FORM MESSAGE
   ===================================================== */

function hideMessage() {

    formMessage.textContent = "";

    formMessage.className = "";

}


/* =====================================================
   VALIDATE FORM
   ===================================================== */

function validateForm() {

    const title =
        tripTitle.value.trim();

    const destination =
        tripDestination.value.trim();

    const date =
        tripDate.value.trim();

    const image =
        tripImage.value.trim();


    /* ---------- Title ---------- */

    if (!title) {

        showMessage(
            "Please enter a trip title.",
            "error"
        );

        tripTitle.focus();

        return false;
    }


    /* ---------- Destination ---------- */

    if (!destination) {

        showMessage(
            "Please enter a destination.",
            "error"
        );

        tripDestination.focus();

        return false;
    }


    /* ---------- Date ---------- */

    if (!date) {

        showMessage(
            "Please select a travel date.",
            "error"
        );

        tripDate.focus();

        return false;
    }


    /* ---------- Image URL ---------- */

    if (image) {

        try {

            new URL(image);

        } catch (error) {

            showMessage(
                "Please enter a valid image URL.",
                "error"
            );

            tripImage.focus();

            return false;
        }
    }


    return true;
}


/* =====================================================
   CREATE TRIP OBJECT
   ===================================================== */

function createTripObject() {

    return {

        id: createTripId(),

        title: tripTitle.value.trim(),

        destination:
            tripDestination.value.trim(),

        date:
            tripDate.value.trim(),

        image:
            tripImage.value.trim(),

        notes:
            tripNotes.value.trim(),

        createdAt:
            new Date().toISOString()

    };
}


/* =====================================================
   CREATE TRIP
   ===================================================== */

function addTrip() {

    const trips = getTrips();

    const newTrip =
        createTripObject();

    trips.push(newTrip);

    saveTrips(trips);

    renderTrips();

    resetForm();

    showMessage(
        "Trip added successfully!",
        "success"
    );


    /*
        Remove the success message after
        a few seconds.
    */

    setTimeout(() => {

        if (editingTripId === null) {
            hideMessage();
        }

    }, 3000);
}


/* =====================================================
   UPDATE TRIP
   ===================================================== */

function updateTrip() {

    const trips = getTrips();

    const tripIndex =
        trips.findIndex(
            trip => trip.id === editingTripId
        );


    if (tripIndex === -1) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    /*
        Keep the existing ID and createdAt.
        Only update the editable fields.
    */

    trips[tripIndex] = {

        ...trips[tripIndex],

        title:
            tripTitle.value.trim(),

        destination:
            tripDestination.value.trim(),

        date:
            tripDate.value.trim(),

        image:
            tripImage.value.trim(),

        notes:
            tripNotes.value.trim(),

        updatedAt:
            new Date().toISOString()
    };


    saveTrips(trips);

    renderTrips();

    resetForm();


    showMessage(
        "Trip updated successfully!",
        "success"
    );


    setTimeout(() => {

        hideMessage();

    }, 3000);
}


/* =====================================================
   DELETE TRIP
   ===================================================== */

function deleteTrip(tripId) {

    const trips = getTrips();

    const trip =
        trips.find(
            item => item.id === tripId
        );


    if (!trip) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    /*
        Confirmation step required by
        the CodGen Week 2 task.
    */

    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${trip.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const updatedTrips =
        trips.filter(
            item => item.id !== tripId
        );


    saveTrips(updatedTrips);

    renderTrips();


    /*
        If the deleted trip was being edited,
        reset the form.
    */

    if (editingTripId === tripId) {

        resetForm();
    }


    showMessage(
        "Trip deleted successfully.",
        "success"
    );


    setTimeout(() => {

        hideMessage();

    }, 3000);
}


/* =====================================================
   EDIT TRIP
   ===================================================== */

function editTrip(tripId) {

    const trips = getTrips();

    const trip =
        trips.find(
            item => item.id === tripId
        );


    if (!trip) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    /*
        Store which trip is being edited.
    */

    editingTripId = tripId;


    /*
        Fill the form with existing data.
    */

    tripTitle.value =
        trip.title || "";

    tripDestination.value =
        trip.destination || "";

    tripDate.value =
        trip.date || "";

    tripImage.value =
        trip.image || "";

    tripNotes.value =
        trip.notes || "";


    /*
        Change UI from Add mode
        to Edit mode.
    */

    formHeading.textContent =
        "Edit Trip";

    submitBtn.textContent =
        "Update Trip";


    /*
        Scroll the user to the form.
    */

    document
        .getElementById("add-trip")
        .scrollIntoView({
            behavior: "smooth"
        });


    showMessage(
        "Edit your trip details and click Update Trip.",
        "success"
    );
}


/* =====================================================
   RENDER TRIPS
   ===================================================== */

function renderTrips() {

    const trips = getTrips();


    /*
        Clear the existing dynamic cards.
    */

    tripList.innerHTML = "";


    /* =================================================
       EMPTY STATE
       ================================================= */

    if (trips.length === 0) {

        tripList.innerHTML = `

            <div id="empty-message">

                <div class="empty-icon">
                    🌍
                </div>

                <h3>
                    No trips added yet
                </h3>

                <p>
                    Start planning your next adventure!
                </p>

                <a
                    href="#add-trip"
                    class="empty-btn"
                >
                    Add Your First Trip
                </a>

            </div>

        `;

        return;
    }


    /* =================================================
       CREATE DYNAMIC TRIP CARDS
       ================================================= */

    trips.forEach(trip => {

        const card =
            document.createElement("article");

        card.className = "trip-card";


        /* ---------- Image ---------- */

        let imageHTML = "";


        if (trip.image) {

            imageHTML = `

                <img
                    src="${escapeHTML(trip.image)}"
                    alt="${escapeHTML(trip.title)}"
                    class="trip-image"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div
                    class="trip-image-placeholder"
                    style="display:none;"
                >
                    🌍
                </div>

            `;

        } else {

            imageHTML = `

                <div class="trip-image-placeholder">
                    🌍
                </div>

            `;
        }


        /* ---------- Notes ---------- */

        const notesHTML =
            trip.notes
                ? `
                    <p class="trip-notes">
                        <strong>Notes:</strong>
                        ${escapeHTML(trip.notes)}
                    </p>
                  `
                : "";


        /* ---------- Complete Card ---------- */

        card.innerHTML = `

            ${imageHTML}

            <div class="trip-content">

                <h3>
                    ${escapeHTML(trip.title)}
                </h3>

                <p>
                    <strong>📍 Destination:</strong>
                    ${escapeHTML(trip.destination)}
                </p>

                <p>
                    <strong>📅 Travel Date:</strong>
                    ${formatDate(trip.date)}
                </p>

                ${notesHTML}


                <div class="trip-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-action="edit"
                        data-id="${escapeHTML(trip.id)}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(trip.id)}"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;


        tripList.appendChild(card);

    });
}


/* =====================================================
   RESET FORM
   ===================================================== */

function resetForm() {

    tripForm.reset();

    editingTripId = null;


    formHeading.textContent =
        "Add a New Trip";


    submitBtn.textContent =
        "Add Trip";


    hideMessage();
}


/* =====================================================
   FORM SUBMIT
   ===================================================== */

tripForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /*
            Validate before Create or Update.
        */

        const isValid =
            validateForm();


        if (!isValid) {
            return;
        }


        /*
            If editingTripId exists,
            update the existing trip.

            Otherwise create a new trip.
        */

        if (editingTripId !== null) {

            updateTrip();

        } else {

            addTrip();

        }

    }
);


/* =====================================================
   CANCEL BUTTON
   ===================================================== */

cancelBtn.addEventListener(
    "click",
    function () {

        resetForm();

        /*
            Scroll back to Add Trip section
            if user was editing.
        */

    }
);


/* =====================================================
   EVENT DELEGATION
   ===================================================== */

/*
    Instead of adding separate event listeners
    to every card button, we use one listener
    on the trip list.
*/

tripList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;

        const tripId =
            button.dataset.id;


        if (!tripId) {
            return;
        }


        /* ---------- Edit ---------- */

        if (action === "edit") {

            editTrip(tripId);

        }


        /* ---------- Delete ---------- */

        if (action === "delete") {

            deleteTrip(tripId);

        }

    }
);


/* =====================================================
   LOAD TRIPS WHEN PAGE OPENS
   ===================================================== */

/*
    READ operation:
    Get trips from localStorage and display them.
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderTrips();

    }
);
