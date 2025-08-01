import { useState } from 'react';

export default function SkillList({
  title,
  items = [],
  placeholder = 'Enter skill...',
  onAdd = () => {},
  renderItem = () => null,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() !== '') {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="col card card-colored card-body mb-4">
      <h4>{title}</h4>
      <div className="skills">
        <ul className="list-group list-group-flush card">
          {items.length === 0 ? (
            <p className="text-muted px-3 py-2">No items added yet.</p>
          ) : (
            items.map((item, index) => renderItem(item, index))
          )}
        </ul>
      </div>
      <div className="input-group mt-3">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button className="btn btn-outline-secondary" type="button" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
}
