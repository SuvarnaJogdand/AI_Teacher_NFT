import { useParams, Link } from "react-router-dom";
import { groupByTopic } from "../utils/groupTopics";

function SubjectPage() {

    const { subject } = useParams();

    const decodedSubject = decodeURIComponent(subject);

    const teachers =
        JSON.parse(
            localStorage.getItem("teachers")
        ) || [];

    const topics =
        groupByTopic(
            teachers,
            decodedSubject
        );

    return (

        <div className="container">

            <h1 className="page-title">
                {decodedSubject}
            </h1>

            <div className="topic-grid">

                {

                    topics.map((topic) => (

                        <Link
                            key={topic}
                            to={`/subject/${encodeURIComponent(decodedSubject)}/topic/${encodeURIComponent(topic)}`}
                            className="topic-card"
                        >

                            <h2>
                                {topic}
                            </h2>

                            <p>

                                View AI Teachers

                            </p>

                        </Link>

                    ))

                }

            </div>

        </div>

    );

}

export default SubjectPage;