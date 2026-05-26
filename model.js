export class GraderModel extends EventTarget {
    constructor() {
        super();
        this.exercises = Array(8).fill(0); // 8 Übungen, Startwert 0
        this.exam = 0;                     // Klausurnote, Startwert 0
        this.attendance = 100;              // Anwesenheit in %, Startwert 100
    }

    setExercisePoints(index, points) {
        this.exercises[index] = Math.min(100, Math.max(0, points));
        this.notifyChange();
    }

    setExamPoints(points) {
        this.exam = Math.min(100, Math.max(0, points));
        this.notifyChange();
    }

    setAttendance(percent) {
        this.attendance = Math.min(100, Math.max(0, percent));
        this.notifyChange();
    }

    isPositive(points) {
        return points > 50; // Laut Angabe: >50 und nicht >=50
    }

    // Ermittelt den Index des Streichergebnisses (die schlechteste Übung)
    getDroppedExerciseIndex() {
        let minIndex = 0;
        let minVal = this.exercises[0];
        for (let i = 1; i < this.exercises.length; i++) {
            if (this.exercises[i] < minVal) {
                minVal = this.exercises[i];
                minIndex = i;
            }
        }
        return minIndex;
    }

    calculateExercisePercentage() {
        const droppedIndex = this.getDroppedExerciseIndex();
        let totalPoints = 0;

        for (let i = 0; i < this.exercises.length; i++) {
            if (i !== droppedIndex) {
                totalPoints += this.exercises[i];
            }
        }

        const maxPossiblePoints = (this.exercises.length - 1) * 100;
        return maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;
    }

    getPositiveExercisesCount() {
        return this.exercises.filter(points => this.isPositive(points)).length;
    }

    calculateTotalGrade() {
        const examPercent = this.exam;
        const exercisePercent = this.calculateExercisePercentage();
        const positiveExercisesCount = this.getPositiveExercisesCount();

        // Kriterien für Positivität prüfen
        const examPositive = this.isPositive(this.exam);
        const exercisesRatioPositive = (positiveExercisesCount / this.exercises.length) >= 0.75;
        const attendancePositive = this.attendance >= 80;

        // Gewichtete Gesamtprozent berechnen
        let totalPercent = (exercisePercent * 0.6) + (examPercent * 0.4);

        let isNegative = false;
        let reasons = [];

        if (!examPositive) {
            isNegative = true;
            reasons.push("Die Klausurnote ist negativ (nicht > 50%).");
        }
        if (!exercisesRatioPositive) {
            isNegative = true;
            reasons.push(`Weniger als 75% der Übungen sind positiv (> 50%). Aktuell: ${positiveExercisesCount} von ${this.exercises.length}.`);
        }
        if (!attendancePositive) {
            isNegative = true;
            reasons.push(`Anwesenheit ist unter 80% (Aktuell: ${this.attendance}%).`);
        }

        let gradeText = "";

        if (isNegative) {
            gradeText = "Nicht Genügend (5)";
        } else {
            if (totalPercent <= 50) gradeText = "Nicht Genügend (5)";
            else if (totalPercent <= 61) gradeText = "Genügend (4)";
            else if (totalPercent <= 74) gradeText = "Befriedigend (3)";
            else if (totalPercent <= 86) gradeText = "Gut (2)";
            else gradeText = "Sehr gut (1)";
        }

        return {
            totalPercent: totalPercent.toFixed(2),
            exercisePercent: exercisePercent.toFixed(2),
            gradeText,
            isNegative,
            reasons,
            droppedIndex: this.getDroppedExerciseIndex()
        };
    }

    notifyChange() {
        this.dispatchEvent(new CustomEvent('modelUpdated'));
    }
}