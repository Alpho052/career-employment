import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GradeEntry = () => {
  const [grades, setGrades] = useState([
    { subject: '', grade: '' }
  ]);
  const [currentGPA, setCurrentGPA] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCurrentGrades = async () => {
      try {
        const data = await studentAPI.getProfile();
        setCurrentGPA(data.student?.gpa || '0.00');
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchCurrentGrades();
  }, []);

  const addGradeField = () => {
    setGrades([...grades, { subject: '', grade: '' }]);
  };

  const removeGradeField = (index) => {
    if (grades.length > 1) {
      const newGrades = grades.filter((_, i) => i !== index);
      setGrades(newGrades);
    }
  };

  const updateGradeField = (index, field, value) => {
    const newGrades = [...grades];
    newGrades[index][field] = value;
    setGrades(newGrades);
  };

  const calculateGPA = () => {
    const validGrades = grades.filter(grade => 
      grade.subject.trim() && !isNaN(parseFloat(grade.grade)) && parseFloat(grade.grade) >= 0
    );
    
    if (validGrades.length === 0) return '0.00';
    
    const total = validGrades.reduce((sum, grade) => sum + parseFloat(grade.grade), 0);
    return (total / validGrades.length).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Validate grades
    const validGrades = grades.filter(grade => 
      grade.subject.trim() && !isNaN(parseFloat(grade.grade)) && parseFloat(grade.grade) >= 0
    );

    if (validGrades.length === 0) {
      setMessage('Please enter at least one valid grade');
      setSaving(false);
      return;
    }

    // Check for invalid grades
    const invalidGrades = grades.filter(grade => 
      grade.subject.trim() && (isNaN(parseFloat(grade.grade)) || parseFloat(grade.grade) < 0 || parseFloat(grade.grade) > 100)
    );

    if (invalidGrades.length > 0) {
      setMessage('Please ensure all grades are numbers between 0 and 100');
      setSaving(false);
      return;
    }

    try {
      const formattedGrades = validGrades.map(grade => ({
        subject: grade.subject.trim(),
        grade: parseFloat(grade.grade)
      }));

      const result = await studentAPI.updateGrades(formattedGrades);
      setMessage(`Grades updated successfully! Your new GPA is: ${result.gpa}`);
      setCurrentGPA(result.gpa);
    } catch (error) {
      setMessage('Error updating grades: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const commonSubjects = [
    'Mathematics', 'English', 'Sesotho', 'Science', 'Biology',
    'Physics', 'Chemistry', 'History', 'Geography', 'Accounting',
    'Economics', 'Business Studies', 'Computer Studies', 'Agriculture'
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Grade Entry</h1>
          <p>Enter your high school grades manually</p>
        </div>

        <div className="grade-layout">
          <Card title="Enter Your Grades" className="grade-form-card">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <div className="current-gpa">
              <strong>Current GPA: {currentGPA}</strong>
              {grades.filter(g => g.subject && g.grade).length > 0 && (
                <span className="projected-gpa">
                  Projected GPA: {calculateGPA()}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {grades.map((grade, index) => (
                <div key={index} className="grade-row">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={grade.subject}
                      onChange={(e) => updateGradeField(index, 'subject', e.target.value)}
                      list="common-subjects"
                      placeholder="Enter subject name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Grade (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={grade.grade}
                      onChange={(e) => updateGradeField(index, 'grade', e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0-100"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => removeGradeField(index)}
                    disabled={grades.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <datalist id="common-subjects">
                {commonSubjects.map(subject => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>

              <div className="grade-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addGradeField}
                >
                  Add Another Subject
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving Grades...' : 'Save Grades'}
                </button>
              </div>
            </form>
          </Card>

          <Card title="Grade Guidelines" className="guidelines-card">
            <h4>Important Information</h4>
            <ul>
              <li>Enter your final high school grades</li>
              <li>Grades should be percentages (0-100%)</li>
              <li>GPA is calculated as the average of all entered grades</li>
              <li>You can update your grades at any time</li>
              <li>Institutions will see your GPA when reviewing applications</li>
            </ul>

            <h4>GPA Scale</h4>
            <div className="gpa-scale">
              <div>80-100%: Excellent</div>
              <div>70-79%: Very Good</div>
              <div>60-69%: Good</div>
              <div>50-59%: Satisfactory</div>
              <div>Below 50%: Needs Improvement</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GradeEntry;