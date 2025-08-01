import { useState, useRef, useEffect } from 'react';

export default function SkillItem({
  id,
  value,
  editable = false,
  onEdit = () => {},
  onDelete = () => {},
  translateMode = false,
  translation = '',
  refText = '',
  className = '',
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputValue.length, inputValue.length);
    }
  }, [isEditing, inputValue]);

  const handleSave = () => {
    const newValue = inputValue.trim() || value;
    if (newValue !== value) {
      onEdit(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  return (
    <li className={`skill-item list-group-item list-group-item-action ${className}`} data-id={id}>
      {translateMode ? (
        <div className="d-flex align-items-center">
          <span className="me-2">{refText}</span>
          <input type="text" className="form-control" defaultValue={translation} placeholder="Enter translation..." />
        </div>
      ) : (
        <div className="d-flex align-items-center">
          {editable && (
            <button
              className="menu-btn shrink btn-outline-danger delete-point me-2"
              onClick={e => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <i className="fas fa-square-minus"></i>
            </button>
          )}

          {isEditing ? (
            <input
              type="text"
              className="form-control form-control-sm skill-item-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
          ) : (
            <span className="point-text" spellCheck={true} onClick={() => editable && setIsEditing(true)}>
              {value}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
