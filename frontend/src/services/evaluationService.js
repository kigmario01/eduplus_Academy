import api from '@/lib/api';

export const evaluationService = {
  async getByCourse(courseId) {
    const res = await api.get(`/evaluations/by-course/${courseId}`);
    return res.data;
  },
  async getEvaluation(evaluationId) {
    const res = await api.get(`/evaluations/${evaluationId}`);
    return res.data;
  },
  async submit(evaluationId, answers) {
    const res = await api.post(`/evaluations/${evaluationId}/submit`, { answers });
    return res.data;
  },
  async getMyCertificates() {
    const res = await api.get('/evaluations/certificates/me');
    return res.data;
  },
  async getCertificateByCode(code) {
    const res = await api.get(`/evaluations/certificates/${code}`);
    return res.data;
  },
  getCertificatePdfUrl(id) {
    return `/api/evaluations/certificates/${id}/pdf`;
  },
};

export default evaluationService;