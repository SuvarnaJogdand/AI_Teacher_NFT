import { useParams, Link } from "react-router-dom";

function TopicPage() {

    const { subject, topic } = useParams();

    const decodedSubject = decodeURIComponent(subject);
    const decodedTopic = decodeURIComponent(topic);

    const teachers =
        JSON.parse(
            localStorage.getItem("teachers")
        ) || [];

    const filteredTeachers =
        teachers.filter(
            (teacher) =>
                teacher.subject === decodedSubject &&
                teacher.topic === decodedTopic
        );

    return (

        <div className="container">

            <h1 className="page-title">
                {decodedTopic}
            </h1>

            <div className="teacher-grid">

                {
                    filteredTeachers.length === 0 ? (

                        <p>No teachers found.</p>

                    ) : (

                        filteredTeachers.map((teacher) => (

                            <div
                                className="teacher-card"
                                key={teacher.tokenId}
                            >

                                <img
                                    src={teacher.imageUrl}
                                    alt={teacher.name}
                                    width="150"
                                />

                                <h2>{teacher.name}</h2>

                                <p>
                                    Subject: {teacher.subject}
                                </p>

                                <p>
                                    Topic: {teacher.topic}
                                </p>

                                <Link
                                    to={`/teacher/${teacher.tokenId}`}
                                >
                                    <button>
                                        View Teacher
                                    </button>
                                </Link>

                            </div>

                        ))

                    )
                }

            </div>

        </div>

    );

}

export default TopicPage;