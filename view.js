export class GraderView {
    constructor() {
        this.exercisesContainer = document.getElementById('exercises-container');
        this.examContainer = document.getElementById('exam-container');
        this.attendanceContainer = document.getElementById('attendance-container');
        this.summaryText = document.getElementById('summary-text');
        this.reasonsContainer = document.getElementById('reasons-container');
    }

    createNumberInput(label, id, min = 0, max = 100, value = 0) {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.id = `group-${id}`;

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.innerText = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.min = min;
        input.max = max;
        input.value = value;

        group.appendChild(labelEl);
        group.appendChild(input);
        return group;
    }

    renderInputs(exerciseCount) {
        // Übungsfelder generieren
        this.exercisesContainer.innerHTML = '';
        for (let i = 0; i < exerciseCount; i++) {
            const inputGroup = this.createNumberInput(`Übung ${i + 1}:`, `exercise-${i}`);
            this.exercisesContainer.appendChild(inputGroup);
        }

        // Klausur & Anwesenheit generieren
        this.examContainer.innerHTML = '';
        this.examContainer.appendChild(this.createNumberInput('Klausur Punkte:', 'exam-input'));

        this.attendanceContainer.innerHTML = '';
        this.attendanceContainer.appendChild(this.createNumberInput('Anwesenheit (%):', 'attendance-input', 0, 100, 100));
    }

    highlightDroppedAndNegative(droppedIndex, exercises, isExamPositive) {
        // Zurücksetzen aller Klassen für Übungen
        exercises.forEach((_, i) => {
            const el = document.getElementById(`group-exercise-${i}`);
            if (el) {
                el.classList.remove('streichergebnis', 'negative', 'positive');

                // Einzelne Übung bewerten für visuelles Feedback
                if (exercises[i] > 50) {
                    el.classList.add('positive');
                } else {
                    el.classList.add('negative');
                }
            }
        });

        // Streichergebnis visuell markieren (überschreibt positiv/negativ farblich)
        const droppedEl = document.getElementById(`group-exercise-${droppedIndex}`);
        if (droppedEl) {
            droppedEl.classList.add('streichergebnis');
        }

        // Klausur hervorheben
        const examEl = document.getElementById('group-exam-input');
        if (examEl) {
            examEl.className = 'form-group ' + (isExamPositive ? 'positive' : 'negative');
        }
    }

    updateResult(resultData) {
        const { totalPercent, exercisePercent, gradeText, isNegative, reasons } = resultData;

        this.summaryText.innerHTML = `
            <p>Übungsnote (gewertet): <span class="${exercisePercent > 50 ? 'positive' : 'negative'}">${exercisePercent}%</span></p>
            <p>Errechnete Gesamtprozent: <strong>${totalPercent}%</strong></p>
            <p>Gesamtnote: <span class="${isNegative ? 'negative' : 'positive'}">${gradeText}</span></p>
        `;

        // Negativ-Gründe rendern
        this.reasonsContainer.innerHTML = '';
        if (isNegative && reasons.length > 0) {
            reasons.forEach(reason => {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerText = reason;
                this.reasonsContainer.appendChild(alert);
            });
        }
    }
}