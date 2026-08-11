export function groupByTopic(teachers, subject) {

    if (!teachers) {
        return [];
    }

    const filteredTeachers = teachers.filter(
        (teacher) => teacher.subject === subject
    );

    const grouped = {};

    filteredTeachers.forEach((teacher) => {

        const topic = teacher.topic;

        if (!topic) return;

        if (!grouped[topic]) {
            grouped[topic] = [];
        }

        grouped[topic].push(teacher);

    });

    return Object.keys(grouped);

}