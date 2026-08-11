export function groupBySubject(teachers) {

    const grouped = {};

    teachers.forEach((teacher) => {

        const subject = teacher.subject;

        if (!grouped[subject]) {

            grouped[subject] = [];

        }

        grouped[subject].push(teacher);

    });

    return grouped;

}