import SkillItem from './SkillItem';

export default function ExperienceSkillItem(props) {
  return (
    <SkillItem
      {...props}
      editable={props.editable ?? false} // default to false in experience context
      className="experience-skill"
    />
  );
}
