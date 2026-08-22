const tripForm = document.getElementById("trip-form");
const tripList = document.getElementById("trip-list");
const emptyMessage = document.getElementById("empty-message");

// Get trips from localStorage
let trips = JSON.parse(localStorage.getItem("trips")) || [];

// Display trips
function displayTrips() {
    tripList.innerHTML = "";

    if (trips.length === 0) {
        tripList.innerHTML = "<p>No trips added yet.</p>";
        return;
    }

    trips.forEach(function (trip) {
        const tripCard = document.createElement("div");

        tripCard.className = "trip-card";

        tripCard.innerHTML = `
            <h3>${trip.title}</h3>
            <p><strong>Destination:</strong> ${trip.destination}</p>
            <p><strong>Date:</strong> ${trip.date}</p>
            <p><strong>Notes:</strong> ${trip.notes || "No notes"}</p>

            <button onclick="editTrip(${trip.id})">Edit</button>
            <button onclick="deleteTrip(${trip.id})">Delete</button>
        `;

        tripList.appendChild(tripCard);
    });
}

function editTrip(id) {
    const trip = trips.find(function (trip) {
        return trip.id === id;
    });

    if (!trip) return;

    const newTitle = prompt("Enter new trip title:", trip.title);
    if (newTitle === null) return;

    const newDestination = prompt(
        "Enter new destination:",
        trip.destination
    );
    if (newDestination === null) return;

    const newDate = prompt("Enter new date:", trip.date);
    if (newDate === null) return;

    const newNotes = prompt("Enter new notes:", trip.notes);
    if (newNotes === null) return;

    if (!newTitle.trim() || !newDestination.trim() || !newDate.trim()) {
        alert("Title, destination and date are required.");
        return;
    }

    trip.title = newTitle.trim();
    trip.destination = newDestination.trim();
    trip.date = newDate.trim();
    trip.notes = newNotes.trim();

    localStorage.setItem("trips", JSON.stringify(trips));

    displayTrips();
}
function deleteTrip(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    trips = trips.filter(function (trip) {
        return trip.id !== id;
    });

    localStorage.setItem("trips", JSON.stringify(trips));

    displayTrips();
}

// Add new trip
tripForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("trip-title").value.trim();
    const destination = document.getElementById("trip-destination").value.trim();
    const date = document.getElementById("trip-date").value;
    const notes = document.getElementById("trip-notes").value.trim();

    if (!title || !destination || !date) {
        alert("Please fill in all required fields.");
        return;
    }

    const newTrip = {
        id: Date.now(),
        title: title,
        destination: destination,
        date: date,
        notes: notes
    };

    trips.push(newTrip);

    // Save to localStorage
    localStorage.setItem("trips", JSON.stringify(trips));

    // Clear form
    tripForm.reset();

    // Display updated trips
    displayTrips();
});

// Display saved trips when page loads
displayTrips();
