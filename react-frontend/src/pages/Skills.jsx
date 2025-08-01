import { useEffect, useState } from 'react';
import SkillItem from '../components/SkillItem';
import SkillList from '../components/SkillList';
import { SkillManager } from '../managers/SkillManager';
import { useTranslation } from '../state/Translation';

export default function Skills() {
  const [hardSkills, setHardSkills] = useState([]);
  const { selectedLangKey } = useTranslation();

  useEffect(() => {
    SkillManager.fetch('hard_skills').then(setHardSkills);
  }, []);

  const handleAdd = async value => {
    const newSkill = await SkillManager.add('hard_skills', value, { lang: selectedLangKey });
    if (newSkill) setHardSkills(prev => [...prev, newSkill]);
  };

  const handleDelete = async id => {
    const success = await SkillManager.delete(id, 'hard_skills');
    if (success) {
      setHardSkills(prev => prev.filter(skill => skill.id !== id));
    }
  };

  const handleEdit = async (id, newText) => {
    const column = `skill_${selectedLangKey}`;
    const success = await SkillManager.update(id, 'hard_skills', { [column]: newText });
    if (success) {
      setHardSkills(prev => prev.map(skill => (skill.id === id ? { ...skill, [column]: newText } : skill)));
    }
  };

  return (
    <div className="container-fluid">
      <h2>Skills Page</h2>
      <SkillList
        title="Hard Skills"
        items={hardSkills}
        placeholder="Add a hard skill..."
        onAdd={handleAdd}
        renderItem={(item, idx) => (
          <SkillItem
            key={idx}
            value={item.skill?.[selectedLangKey] ?? ''}
            editable={true}
            onDelete={() => handleDelete(item.id)}
            onEdit={newText => handleEdit(item.id, newText)}
          />
        )}
      />
    </div>
  );
}
