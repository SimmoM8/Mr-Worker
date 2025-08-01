export default function SkillItem({
  text,
  editable = false,
  onEdit = () => {},
  onDelete = () => {},
  translateMode = false,
  translation = '',
  refText = '',
  className = '',
}) {
  return (
    <li className={`skill-item list-group-item d-flex justify-content-between align-items-center ${className}`}>
      <span className="skill-text">{translateMode ? refText : text}</span>

      <div className="skill-controls ms-3">
        {translateMode && (
          <input type="text" className="form-control" defaultValue={translation} placeholder="Enter translation..." />
        )}

        {editable && (
          <div className="btn-group ms-2">
            <button onClick={onEdit} className="btn btn-sm btn-outline-secondary">
              ✏️
            </button>
            <button onClick={onDelete} className="btn btn-sm btn-outline-danger">
              🗑️
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
