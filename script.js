/* =====================================================
   WANDERLOG WEEK 3
   CRUD + PHOTO UPLOAD + FILEREADER + BASE64
   ===================================================== */

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

const formMessage =
    document.getElementById("form-message");

const formHeading =
    document.getElementById("form-heading");

const submitBtn =
    document.getElementById("submit-btn");

const cancelBtn =
    document.getElementById("cancel-btn");

const imagePreviewContainer =
    document.getElementById("image-preview-container");

const imagePreview =
    document.getElementById("image-preview");

const removeImageBtn =
    document.getElementById("remove-image-btn");

const detailModal =
    document.getElementById("trip-detail-modal");

const detailContent =
    document.getElementById("trip-detail-content");

const closeDetailBtn =
    document.getElementById("close-detail-btn");


/* ================= EDIT STATE ================= */

let editingTripId = null;


/*
    Stores the Base64 image.

    This is separate from the file input because
    the FileReader converts the selected image
    into a Base64 string.
*/

let selectedImageBase64 = "";


/* =====================================================
   GET TRIPS
   ===================================================== */

function getTrips() {

    const storedTrips =
        localStorage.getItem(STORAGE_KEY);

    if (!storedTrips) {
        return [];
    }

    try {

        const trips = JSON.parse(storedTrips);

        return Array.isArray(trips)
            ? trips
            : [];

    } catch (error) {

        console.error(
            "Error reading trips:",
            error
        );

        return [];
    }
}


/* =====================================================
   SAVE TRIPS
   ===================================================== */

function saveTrips(trips) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(trips)
        );

        return true;

    } catch (error) {

        console.error(
            "Could not save trips:",
            error
        );

        showMessage(
            "Storage is full. Please use a smaller image.",
            "error"
        );

        return false;
    }
}


/* =====================================================
   CREATE ID
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

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
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

    const date =
        new Date(dateString + "T00:00:00");

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
   MESSAGE
   ===================================================== */

function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className = type;
}


function hideMessage() {

    formMessage.textContent = "";

    formMessage.className = "";
}


/* =====================================================
   WEEK 3 — FILEREADER PHOTO PREVIEW
   ===================================================== */

tripImage.addEventListener(
    "change",
    function () {

        const file = tripImage.files[0];

        if (!file) {
            return;
        }


        /* ---------- Check file type ---------- */

        if (!file.type.startsWith("image/")) {

            showMessage(
                "Please select a valid image file.",
                "error"
            );

            tripImage.value = "";

            return;
        }


        /* ---------- Check file size ---------- */

        const maxSize =
            2 * 1024 * 1024;

        if (file.size > maxSize) {

            showMessage(
                "Image must be smaller than 2 MB.",
                "error"
            );

            tripImage.value = "";

            return;
        }


        /*
            FileReader converts the selected
            image into a Base64 data URL.
        */

        const reader = new FileReader();


        reader.onload = function (event) {

            selectedImageBase64 =
                event.target.result;


            /*
                Show live preview before
                the trip is saved.
            */

            imagePreview.src =
                selectedImageBase64;

            imagePreviewContainer.style.display =
                "block";

            hideMessage();
        };


        reader.onerror = function () {

            showMessage(
                "Unable to read the selected image.",
                "error"
            );

        };


        reader.readAsDataURL(file);
    }
);


/* =====================================================
   REMOVE SELECTED IMAGE
   ===================================================== */

removeImageBtn.addEventListener(
    "click",
    function () {

        tripImage.value = "";

        selectedImageBase64 = "";

        imagePreview.src = "";

        imagePreviewContainer.style.display =
            "none";
    }
);


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


    if (!title) {

        showMessage(
            "Please enter a trip title.",
            "error"
        );

        tripTitle.focus();

        return false;
    }


    if (!destination) {

        showMessage(
            "Please enter a destination.",
            "error"
        );

        tripDestination.focus();

        return false;
    }


    if (!date) {

        showMessage(
            "Please select a travel date.",
            "error"
        );

        tripDate.focus();

        return false;
    }


    return true;
}


/* =====================================================
   CREATE TRIP OBJECT
   ===================================================== */

function createTripObject() {

    return {

        id: createTripId(),

        title:
            tripTitle.value.trim(),

        destination:
            tripDestination.value.trim(),

        date:
            tripDate.value.trim(),

        /*
            WEEK 3:
            Store the Base64 image.
        */

        image:
            selectedImageBase64,

        notes:
            tripNotes.value.trim(),

        createdAt:
            new Date().toISOString()
    };
}


/* =====================================================
   ADD TRIP
   ===================================================== */

function addTrip() {

    const trips = getTrips();

    const newTrip =
        createTripObject();

    trips.push(newTrip);

    if (!saveTrips(trips)) {
        return;
    }

    renderTrips();

    resetForm();

    showMessage(
        "Trip added successfully!",
        "success"
    );

    setTimeout(
        hideMessage,
        3000
    );
}


/* =====================================================
   UPDATE TRIP
   ===================================================== */

function updateTrip() {

    const trips = getTrips();

    const tripIndex =
        trips.findIndex(
            trip =>
                trip.id === editingTripId
        );


    if (tripIndex === -1) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    /*
        If user selects a new image,
        selectedImageBase64 contains it.

        Otherwise keep existing image.
    */

    const existingImage =
        trips[tripIndex].image || "";


    trips[tripIndex] = {

        ...trips[tripIndex],

        title:
            tripTitle.value.trim(),

        destination:
            tripDestination.value.trim(),

        date:
            tripDate.value.trim(),

        image:
            selectedImageBase64 ||
            existingImage,

        notes:
            tripNotes.value.trim(),

        updatedAt:
            new Date().toISOString()
    };


    if (!saveTrips(trips)) {
        return;
    }

    renderTrips();

    resetForm();

    showMessage(
        "Trip updated successfully!",
        "success"
    );

    setTimeout(
        hideMessage,
        3000
    );
}


/* =====================================================
   DELETE TRIP
   ===================================================== */

function deleteTrip(tripId) {

    const trips = getTrips();

    const trip =
        trips.find(
            item =>
                item.id === tripId
        );


    if (!trip) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${trip.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const updatedTrips =
        trips.filter(
            item =>
                item.id !== tripId
        );


    saveTrips(updatedTrips);

    renderTrips();

    showMessage(
        "Trip deleted successfully.",
        "success"
    );

    setTimeout(
        hideMessage,
        3000
    );
}


/* =====================================================
   EDIT TRIP
   ===================================================== */

function editTrip(tripId) {

    const trips = getTrips();

    const trip =
        trips.find(
            item =>
                item.id === tripId
        );


    if (!trip) {

        showMessage(
            "Trip could not be found.",
            "error"
        );

        return;
    }


    editingTripId = tripId;


    tripTitle.value =
        trip.title || "";

    tripDestination.value =
        trip.destination || "";

    tripDate.value =
        trip.date || "";

    tripNotes.value =
        trip.notes || "";


    /*
        Load existing Base64 image
        into preview.
    */

    selectedImageBase64 =
        trip.image || "";


    if (selectedImageBase64) {

        imagePreview.src =
            selectedImageBase64;

        imagePreviewContainer.style.display =
            "block";

    } else {

        imagePreview.src = "";

        imagePreviewContainer.style.display =
            "none";
    }


    formHeading.textContent =
        "Edit Trip";

    submitBtn.textContent =
        "Update Trip";


    document
        .getElementById("add-trip")
        .scrollIntoView({
            behavior: "smooth"
        });


    showMessage(
        "Edit your trip and click Update Trip.",
        "success"
    );
}


/* =====================================================
   IMAGE HTML
   ===================================================== */

function createImageHTML(trip) {

    if (trip.image) {

        return `

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

    }


    return `

        <div class="trip-image-placeholder">
            🌍
        </div>

    `;
}


/* =====================================================
   RENDER TRIPS
   ===================================================== */

function renderTrips() {

    const trips = getTrips();

    tripList.innerHTML = "";


    /* ================= EMPTY STATE ================= */

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


    /* ================= CARDS ================= */

    trips.forEach(
        function (trip) {

            const card =
                document.createElement("article");

            card.className =
                "trip-card";


            const notesHTML =
                trip.notes
                    ? `
                        <p class="trip-notes">
                            <strong>Notes:</strong>
                            ${escapeHTML(trip.notes)}
                        </p>
                      `
                    : "";


            card.innerHTML = `

                ${createImageHTML(trip)}

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
                            class="view-btn"
                            data-action="view"
                            data-id="${escapeHTML(trip.id)}"
                        >
                            👁️ View
                        </button>

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

        }
    );
}


/* =====================================================
   VIEW TRIP DETAIL
   ===================================================== */

function viewTrip(tripId) {

    const trips = getTrips();

    const trip =
        trips.find(
            item =>
                item.id === tripId
        );


    if (!trip) {
        return;
    }


    let imageHTML;


    if (trip.image) {

        imageHTML = `

            <img
                src="${escapeHTML(trip.image)}"
                alt="${escapeHTML(trip.title)}"
                class="detail-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div
                class="detail-placeholder"
                style="display:none;"
            >
                🌍
            </div>

        `;

    } else {

        imageHTML = `

            <div class="detail-placeholder">
                🌍
            </div>

        `;
    }


    detailContent.innerHTML = `

        ${imageHTML}

        <div class="detail-content">

            <h2>
                ${escapeHTML(trip.title)}
            </h2>

            <p>
                <strong>📍 Destination:</strong>
                ${escapeHTML(trip.destination)}
            </p>

            <p>
                <strong>📅 Travel Date:</strong>
                ${formatDate(trip.date)}
            </p>

            ${
                trip.notes
                    ? `
                        <div class="detail-notes">

                            <strong>Notes</strong>

                            <p>
                                ${escapeHTML(trip.notes)}
                            </p>

                        </div>
                      `
                    : ""
            }

        </div>
    `;


    detailModal.classList.add("active");

    detailModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* =====================================================
   CLOSE DETAIL
   ===================================================== */

function closeDetail() {

    detailModal.classList.remove("active");

    detailModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


closeDetailBtn.addEventListener(
    "click",
    closeDetail
);


detailModal.addEventListener(
    "click",
    function (event) {

        if (event.target === detailModal) {
            closeDetail();
        }

    }
);


/* =====================================================
   RESET FORM
   ===================================================== */

function resetForm() {

    tripForm.reset();

    editingTripId = null;

    selectedImageBase64 = "";

    imagePreview.src = "";

    imagePreviewContainer.style.display =
        "none";

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


        if (!validateForm()) {
            return;
        }


        if (editingTripId !== null) {

            updateTrip();

        } else {

            addTrip();

        }

    }
);


/* =====================================================
   CANCEL
   ===================================================== */

cancelBtn.addEventListener(
    "click",
    function () {

        resetForm();

    }
);


/* =====================================================
   EVENT DELEGATION
   ===================================================== */

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


        if (!tripI
