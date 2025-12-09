/**
 * SportsConnect State Management
 * Simulates a backend database using localStorage
 */

const STATE_KEY = 'sports_connect_data';

// Initial Mock Data
const INITIAL_DATA = {
    users: [
        { id: 'u1', name: 'John Doe', role: 'player', email: 'john@example.com' },
        { id: 'u2', name: 'Coach Mike', role: 'coach', email: 'mike@example.com', sport: 'Football' },
        { id: 'u3', name: 'Green Field Arena', role: 'turf', email: 'turf@example.com', location: 'Downtown' }
    ],
    turfs: [
        { id: 't1', ownerId: 'u3', name: 'Green Field Arena', price: 50, location: 'Downtown', image: 'turf-1.jpg' },
        { id: 't2', ownerId: 'u3', name: 'Indoor Court', price: 40, location: 'Uptown', image: 'turf-2.jpg' }
    ],
    bookings: [
        { id: 'b1', turfId: 't1', userId: 'u1', date: '2025-12-10', time: '18:00', status: 'confirmed' }
    ],
    coachingSessions: [
        { id: 's1', coachId: 'u2', studentId: 'u1', date: '2025-12-12', time: '10:00', status: 'pending' }
    ]
};

class StateManager {
    constructor() {
        this.load();
    }

    load() {
        const stored = localStorage.getItem(STATE_KEY);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = INITIAL_DATA;
            this.save();
        }
    }

    save() {
        localStorage.setItem(STATE_KEY, JSON.stringify(this.data));
    }

    // --- Getters ---
    getUsers() { return this.data.users; }
    getTurfs() { return this.data.turfs; }
    getBookings() { return this.data.bookings; }

    getBookingsForUser(userId) {
        return this.data.bookings.filter(b => b.userId === userId);
    }

    getBookingsForTurf(turfId) {
        return this.data.bookings.filter(b => b.turfId === turfId);
    }

    // --- Actions ---

    // Book a turf
    bookTurf(userId, turfId, date, time) {
        const newBooking = {
            id: 'b' + Date.now(),
            turfId,
            userId,
            date,
            time,
            status: 'confirmed' // Auto-confirm for demo
        };
        this.data.bookings.push(newBooking);
        this.save();
        return newBooking;
    }

    // Cancel a booking
    cancelBooking(bookingId) {
        this.data.bookings = this.data.bookings.filter(b => b.id !== bookingId);
        this.save();
    }

    // Helper to get formatted turf name
    getTurfName(turfId) {
        const turf = this.data.turfs.find(t => t.id === turfId);
        return turf ? turf.name : 'Unknown Turf';
    }
}

// Global instance
const appState = new StateManager();
