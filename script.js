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


// Get saved trips
let trips = JSON.parse(localStorage.getItem("trips")) || [];


// Track editing trip
let editingTripId = null;


// -------------------------
// SAVE TRIPS
// -------------------------
function saveTrips() {
    localStorage.setItem("trips", JSON.stringify(trips));
}


// -------------------------
// SHOW MESSAGE
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
// DISPLAY TRIPS
// -------------------------
function displayTrips() {

    tripList.innerHTML = "";

    if (trips.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.id = "empty-message";

        emptyMessage.textContent =
            "No trips added yet. Start planning your next adventure!";

        tripList.appendChild(emptyMessage);

        return;
    }


    trips.forEach(function (trip) {

        const tripCard = document.createElement("article");

        tripCard.className = "trip-card";


        // Image
        if (trip.image) {

            const image = document.createElement("img");

            image.src = trip.image;
            image.alt = trip.title;
            image.className = "trip-image";

            image.onerror = function () {
                image.style.display = "none";
            };

            tripCard.appendChild(image);
        }


        // Title
        const title = document.createElement("h3");

        title.textContent = trip.title;

        tripCard.appendChild(title);


        // Destination
        const destination = document.createElement("p");

        destination.innerHTML = "<strong>📍 Destination:</strong> ";

        destination.append(trip.destination);

        tripCard.appendChild(destination);


        // Date
        const date = document.createElement("p");

        date.innerHTML = "<strong>📅 Date:</strong> ";

        date.append(formatDate(trip.date));

        tripCard.appendChild(date);


        // Notes
        const notes = document.createElement("p");

        notes.innerHTML = "<strong>📝 Notes:</strong> ";

        notes.append(trip.notes || "No notes");

        tripCard.appendChild(notes);


        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editTrip(trip.id);
        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteTrip(trip.id);
        });


        tripCard.appendChild(editButton);
        tripCard.appendChild(deleteButton);

        tripList.appendChild(tripCard);
    });
}


// -------------------------
// FORMAT DATE
// -------------------------
function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// -------------------------
// ADD / UPDATE TRIP
// -------------------------
tripForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const title = titleInput.value.trim();
    const destination = destinationInput.value.trim();
    const date = dateInput.value;
    const image = imageInput.value.trim();
    const notes = notesInput.value.trim();


    // Required validation
    if (!title || !destination || !date) {

        showMessage(
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    // Title validation
    if (title.length < 3) {

        showMessage(
            "Trip title must be at least 3 characters.",
            "error"
        );

        return;
    }


    // Destination validation
    if (destination.length < 2) {

        showMessage(
            "Please enter a valid destination.",
            "error"
        );

        return;
    }


    // -------------------------
    // UPDATE
    // -------------------------
    if (editingTripId !== null) {

        const trip = trips.find(function (trip) {
            return trip.id === editingTripId;
        });


        if (trip) {

            trip.title = title;
            trip.destination = destination;
            trip.date = date;
            trip.image = image;
            trip.notes = notes;

            showMessage(
                "Trip updated successfully!",
                "success"
            );
        }

    }


    // -------------------------
    // CREATE
    // -------------------------
    else {

        const newTrip = {

            id: Date.now(),

            title: title,

            destination: destination,

            date: date,

            image: image,

            notes: notes
        };


        trips.push(newTrip);


        showMessage(
            "Trip added successfully!",
            "success"
        );
    }


    saveTrips();

    displayTrips();

    resetForm();
});


// -------------------------
// EDIT TRIP
// -------------------------
function editTrip(id) {

    const trip = trips.find(function (trip) {
        return trip.id === id;
    });


    if (!trip) {
        return;
    }


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


    if (!trip) {
        return;
    }


    const confirmDelete = confirm(
        `Are you sure you want to delete "${trip.title}"?`
    );


    if (!confirmDelete) {
        return;
    }


    trips = trips.filter(function (trip) {
        return trip.id !== id;
    });


    saveTrips();

    displayTrips();


    showMessage(
        "Trip deleted successfully!",
        "success"
    );
}


// -------------------------
// RESET FORM
// -------------------------
function resetForm() {

    tripForm.reset();

    editingTripId = null;

    formHeading.textContent = "Add a New Trip";

    submitBtn.textContent = "Add Trip";

    cancelBtn.style.display = "none";
}


// -------------------------
// CANCEL EDIT
// -------------------------
cancelBtn.addEventListener("click", function () {

    resetForm();
});


// -------------------------
// PREVENT PAST DATES
// -------------------------
const today = new Date()
    .toISOString()
    .split("T")[0];

dateInput.min = today;


// -------------------------
// INITIAL LOAD
// -------------------------
displayTrips();

cancelBtn.style.display = "none";
