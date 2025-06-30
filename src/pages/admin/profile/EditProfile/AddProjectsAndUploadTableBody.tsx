import { ProjectData } from "utils/supabase/profileService";
import { Delete, Edit } from "utils/Constant";

interface AddProjectsAndUploadTableBodyProps {
  projects: ProjectData[];
  onEdit: (project: ProjectData) => void;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

const AddProjectsAndUploadTableBody = ({ projects, onEdit, onDelete, loading }: AddProjectsAndUploadTableBodyProps) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning';
      case 'on hold':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="text-center">Loading projects...</td>
        </tr>
      </tbody>
    );
  }

  if (projects.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="text-center">No projects found. Add your first project!</td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {projects.map((project) => (
        <tr key={project.id}>
          <td>
            <a className="text-inherit" href="#">
              {project.project_name}
            </a>
          </td>
          <td>{project.date}</td>
          <td>
            <span className={`status-icon ${getStatusClass(project.status)}`} /> {project.status}
          </td>
          <td>{project.price}</td>
          <td className="text-end">
            <button 
              className="btn btn-primary btn-sm me-2" 
              onClick={() => onEdit(project)}
              disabled={loading}
            >
              <i className="fa fa-pencil" /> {Edit}
            </button>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => project.id && onDelete(project.id)}
              disabled={loading}
            >
              <i className="fa fa-trash" /> {Delete}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default AddProjectsAndUploadTableBody;
