import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";

export default function QuestionCard({
    index,
    question,
    onChangeText,
    onChangeMarks,
    onChangeOption,
    onAddOption,
    onRemoveOption,
    onSetCorrectOption,
    onDuplicate,
    onDelete,
    canDeleteQuestion = true,
}) {
    
    
    
    
    
    
    
    
    const [open, setOpen] = useState(true);




    return (
        <article className="qc-card">
            <div className="qc-head">
                <button
                    type="button"
                    className="qc-toggle"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Collapse question" : "Expand question"}
                >
                    <span className="qc-number">Question {index + 1}</span>
                    <span className="qc-meta">
                        {question.options?.length || 0} options • {question.marks || 1} mark(s)
                    </span>
                </button>

                <div className="qc-actions">
                    <button type="button" className="qc-icon-btn" onClick={onDuplicate} title="Duplicate question">
                        <Copy size={16} />
                    </button>
                    <button
                        type="button"
                        className="qc-icon-btn qc-danger"
                        onClick={onDelete}
                        disabled={!canDeleteQuestion}
                        title="Delete question"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        type="button"
                        className="qc-icon-btn"
                        onClick={() => setOpen((v) => !v)}
                        title={open ? "Collapse" : "Expand"}
                    >
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="qc-body">
                    <div className="qc-grid">
                        <div className="qc-field qc-field-full">
                            <label>Question Text *</label>
                            <textarea
                                rows={4}
                                placeholder="Enter the question"
                                value={question.questionText}
                                onChange={(e) => onChangeText(e.target.value)}
                                required
                            />
                        </div>

                        <div className="qc-field">
                            <label>Marks</label>
                            <input
                                type="number"
                                min="1"
                                value={question.marks}
                                onChange={(e) => onChangeMarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="qc-options-head">
                        <h4>Options</h4>
                        <button type="button" className="qc-add-option" onClick={onAddOption}>
                            <Plus size={16} />
                            Add Option
                        </button>
                    </div>

                    <div className="qc-options">
                        {question.options.map((option, optionIndex) => (
                            <div className="qc-option-row" key={optionIndex}>
                                <label className="qc-radio-wrap">
                                    <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={question.correctOptionIndex === optionIndex}
                                        onChange={() => onSetCorrectOption(optionIndex)}
                                    />
                                    <span className="qc-radio-mark" />
                                </label>

                                <input
                                    type="text"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => onChangeOption(optionIndex, e.target.value)}
                                />

                                <button
                                    type="button"
                                    className="qc-remove-option"
                                    onClick={() => onRemoveOption(optionIndex)}
                                    disabled={question.options.length <= 2}
                                    title="Remove option"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="qc-footer">
                        <span className="qc-hint">
                            Choose the correct option using the radio on the left.
                        </span>
                    </div>
                </div>
            )}
        </article>
    );


}
