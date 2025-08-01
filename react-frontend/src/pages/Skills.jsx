import SkillItem from '../components/SkillItem';

export default function Skills() {
  const skills = ['Teamwork', 'Photoshop', 'Public Speaking'];

  return (
    <>
      <h2>Skills Page</h2>
      <ul className="list-group">
        {skills.map((skill, idx) => (
          <SkillItem key={idx} text={skill} editable={true} onDelete={() => alert(`Delete ${skill}`)} />
        ))}
      </ul>
    </>
  );
}
