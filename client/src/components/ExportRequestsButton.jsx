import { FiDownload } from 'react-icons/fi';
import { api, authHeaders } from '../utils/api';
import { getToken } from '../utils/auth';

const ExportRequestsButton = () => {
  const handleExport = async () => {
    const token = getToken();
    try {
      const response = await api.get('/export-requests', {
        ...authHeaders(token),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'requests.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting requests:', error);
    }
  };

  return (
    <button type="button" onClick={handleExport} className="btn-secondary text-sm">
      <FiDownload /> Export CSV
    </button>
  );
};

export default ExportRequestsButton;
