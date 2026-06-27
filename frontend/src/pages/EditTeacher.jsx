import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TeacherForm from "../components/TeacherForm";

function EditTeacher() {
  const { id } = useParams();

  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const teachers =
      JSON.parse(localStorage.getItem("teachers")) || [];

    const foundTeacher = teachers.find(
      (t) => String(t.id) === id
    );

    setTeacher(foundTeacher);
  }, [id]);

  if (!teacher) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar />
      <h1>Edit Teacher</h1>

      <TeacherForm
        existingTeacher={teacher}
      />
    </>
  );
}

export default EditTeacher;