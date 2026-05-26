import { GraderModel } from './model.js';
import { GraderView } from './view.js';

class GraderController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Initiale Inputs in der View aufbauen (8 Übungen)
        this.view.renderInputs(this.model.exercises.length);

        // Event-Listener registrieren
        this.setupEventListeners();

        // Auf Änderungen im Model reagieren (Custom Event)
        this.model.addEventListener('modelUpdated', () => this.handleModelUpdate());

        // Einmal am Anfang berechnen
        this.handleModelUpdate();
    }

    setupEventListeners() {
        const form = document.getElementById('grader-form');

        // Event-Delegation nutzen: Ein Eventlistener für das ganze Formular (on input / change)
        form.addEventListener('input', (event) => {
            const target = event.target;
            const value = parseInt(target.value) || 0;

            if (target.id.startsWith('exercise-')) {
                const index = parseInt(target.id.split('-')[1]);
                this.model.setExercisePoints(index, value);
            } else if (target.id === 'exam-input') {
                this.model.setExamPoints(value);
            } else if (target.id === 'attendance-input') {
                this.model.setAttendance(value);
            }
        });
    }

    handleModelUpdate() {
        const resultData = this.model.calculateTotalGrade();

        // 1. Optische Highlights setzen
        this.view.highlightDroppedAndNegative(
            resultData.droppedIndex,
            this.model.exercises,
            this.model.isPositive(this.model.exam)
        );

        // 2. Ergebniswerte anzeigen
        this.view.updateResult(resultData);
    }
}

// App starten sobald DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const model = new GraderModel();
    const view = new GraderView();
    new GraderController(model, view);
});