const tripForm = document.getElementById("trip-form");
const tripList = document.getElementById("trip-list");

const formHeading = document.getElementById("form-heading");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formMessage = document.getElementById("form-message");

const titleInput = document.getElementById("trip-title");
const destinationInput = document.getElementById("trip-destination");
const dateInput = document.getElementById("trip-date");
const imageInput = document.getElementById("trip-image");
const notesInput = document.getElementById("trip-notes");

const STORAGE_KEY = "wanderlogTrips";

let trips = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingTripId = null;


// -------------------------
// READ - Display trips
// -------------------------
function displayTrips() {
    tripList.innerHTML = "";

    if (trips.length === 0) {
        tripList.innerHTML = `
            <p id="empty-message">
                No trips added yet. Start planning your next adventure!
            </p>
        `;
        return;
    }

    trips.forEach(function (trip) {

        const tripCard = document.createElement("article");
        tripCard.className = "trip-card";

        const formattedDate = new Date(trip.date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

        tripCard.innerHTML = `
            ${
                trip.image
                    ? `<img src="${trip.image}" alt="${escapeHTML(trip.title)}" class="trip-image">`
                    : ""
            }

            <div class="trip-card-content">

                <h3>${escapeHTML(trip.title)}</h3>

                <p>
                    <strong>📍 Destination:</strong>
                    ${escapeHTML(trip.destination)}
                </p>

                <p>
                    <strong>📅 Date:</strong>
                    ${formattedDate}
                </p>

                ${
                    trip.notes
                        ? `<p><strong>📝 Notes:</strong> ${escapeHTML(trip.notes)}</p>`
                        : ""
                }

                <div class="trip-actions">
                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${trip.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${trip.id}"
                    >
                        Delete
                    </button>
                </div>

            </div>
        `;

        tripList.appendChild(tripCard);
    });
}


// -------------------------
// CREATE / UPDATE
// -------------------------
tripForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const destination = destinationInput.value.trim();
    const date = dateInput.value;
    const image = imageInput.value.trim();
    const notes = notesInput.value.trim();

    if (!title || !destination || !date) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    if (editingTripId !== null) {

        // UPDATE
        trips = trips.map(function (trip) {

            if (trip.id === editingTripId) {
                return {
                    ...trip,
                    title: title,
                    destination: destination,
                    date: date,
                    image: image,
                    notes: notes
                };
            }

            return trip;
        });

        showMessage("Trip updated successfully!", "success");

    } else {

        // CREATE
        const newTrip = {
            id: Date.now(),
            title: title,
            destination: destination,
            date: date,
            image: image,
            notes: notes
        };

        trips.push(newTrip);

        showMessage("Trip added successfully!", "success");
    }

    saveTrips();
    displayTrips();

    resetForm();
});


// -------------------------
// EDIT / DELETE
// -------------------------
tripList.addEventListener("click", function (event) {

    const id = Number(event.target.dataset.id);

    if (event.target.classList.contains("edit-btn")) {
        editTrip(id);
    }

    if (event.target.classList.contains("delete-btn")) {
        deleteTrip(id);
    }
});


// -------------------------
// EDIT TRIP
// -------------------------
function editTrip(id) {

    const trip = trips.find(function (trip) {
        return trip.id === id;
    });

    if (!trip) return;

    editingTripId = id;

    titleInput.value = trip.title;
    destinationInput.value = trip.destination;
    dateInput.value = trip.date;
    imageInput.value = trip.image || "";
    notesInput.value = trip.notes || "";

    formHeading.textContent = "Edit Trip";
    submitBtn.textContent = "Update Trip";
    cancelBtn.style.display = "inline-block";

    document.getElementById("add-trip").scrollIntoView({
        behavior: "smooth"
    });
}


// -------------------------
// DELETE TRIP
// -------------------------
function deleteTrip(id) {

    const trip = trips.find(function (trip) {
        return trip.id === id;
    });

    if (!trip) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${trip.title}"?`
    );

    if (!confirmed) return;

    trips = trips.filter(function (trip) {
        return trip.id !== id;
    });

    saveTrips();
    displayTrips();

    showMessage("Trip deleted successfully!", "success");
}


// -------------------------
// CANCEL EDIT
// -------------------------
cancelBtn.addEventListener("click", function () {
    resetForm();
});


// -------------------------
// RESET FORM
// -------------------------
function resetForm() {

    tripForm.reset();

    editingTripId = null;

    formHeading.textContent = "Add a New Trip";
    submitBtn.textContent = "Add Trip";

    cancelBtn.style.display = "none";

    formMessage.textContent = "";
    formMessage.className = "";
}


// -------------------------
// SAVE TO localStorage
// -------------------------
function saveTrips() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(trips)
    );
}


// -------------------------
// MESSAGE
// -------------------------
function showMessage(message, type) {

    formMessage.textContent = message;
    formMessage.className = type;

    setTimeout(function () {
        formMessage.textContent = "";
        formMessage.className = "";
    }, 3000);
}


// -------------------------
// BASIC HTML escaping
// -------------------------
function escapeHTML(value) {

    const div = document.createElement("div");
    div.textContent = value;

    return div.innerHTML;
}


// -------------------------
// INITIAL LOAD
// -------------------------
displayTrips();
cancelBtn.style.display = "none";
