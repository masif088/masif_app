import React, { useState, useRef, useEffect } from 'react';
import { Input, FormGroup, Label } from 'reactstrap';

interface SkillsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const SkillsInput: React.FC<SkillsInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your skills (e.g., React, TypeScript, Node.js)",
  label = "Skills"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Common skills suggestions
  const commonSkills = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Flutter',
    'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Express.js', 'Django', 'Flask',
    'Laravel', 'Spring Boot', 'ASP.NET', 'GraphQL', 'REST API', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Google Cloud', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'Travis CI',
    'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier', 'Jest', 'Cypress',
    'Selenium', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'HTML', 'CSS', 'SCSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
    'Ant Design', 'Chakra UI', 'Redux', 'Zustand', 'MobX', 'React Query',
    'Apollo Client', 'Prisma', 'TypeORM', 'Sequelize', 'Mongoose', 'JWT',
    'OAuth', 'Firebase', 'Supabase', 'Stripe', 'PayPal', 'Twilio', 'SendGrid'
  ];

  // Parse current skills from value string
  const currentSkills = value ? value.split(',').map(skill => skill.trim()).filter(Boolean) : [];

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !currentSkills.includes(skill)
      );
      setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setSuggestions([]);
    }
  }, [inputValue, currentSkills]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !currentSkills.includes(inputValue.trim())) {
        addSkill(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && currentSkills.length > 0) {
      removeSkill(currentSkills[currentSkills.length - 1]);
    }
  };

  // Add a skill
  const addSkill = (skill: string) => {
    const newSkills = [...currentSkills, skill];
    onChange(newSkills.join(', '));
    setInputValue('');
    setIsOpen(false);
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
    onChange(newSkills.join(', '));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    addSkill(suggestion);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <FormGroup>
      <Label>{label}</Label>
      <div className="position-relative" ref={dropdownRef}>
        <div className="">
          

          {/* Skills tags */}
          <div className="skills-tags mb-1">
            {currentSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  className="skill-tag-remove"
                  onClick={() => removeSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Input field */}
          <Input
            innerRef={inputRef}
            type="text"
            placeholder={currentSkills.length === 0 ? placeholder : "Add more skills..."}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsOpen(true)}
            className="skills-input"
          />
          
          
        </div>

        {/* Dropdown suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div className="skills-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="skills-suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .skills-input-container {
          position: relative;
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
          min-height: 38px;
          background: white;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.25rem;
        }

        .skills-input-container:focus-within {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .skill-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .skill-tag-remove {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          margin-left: 0.25rem;
        }

        .skill-tag-remove:hover {
          color: #dc3545;
        }

        .skills-input {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          flex: 1;
          min-width: 120px;
          padding: 0 !important;
          background: transparent !important;
        }

        .skills-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ced4da;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .skills-suggestion {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid #f8f9fa;
        }

        .skills-suggestion:hover {
          background: #f8f9fa;
        }

        .skills-suggestion:last-child {
          border-bottom: none;
        }
      `}</style>
    </FormGroup>
  );
};

export default SkillsInput; 