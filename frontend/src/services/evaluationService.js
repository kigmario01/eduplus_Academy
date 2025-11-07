import { evaluationApi } from '@/lib/api';

export const evaluationService = {
  async getByCourse(courseId) {
    const res = await evaluationApi.get(`/by-course/${courseId}`);
    return res.data;
  },
  async getEvaluation(evaluationId) {
    const res = await evaluationApi.get(`/${evaluationId}`);
    return res.data;
  },
  async submit(evaluationId, answers) {
    const res = await evaluationApi.post(`/${evaluationId}/submit`, { answers });
    return res.data;
  },
  async getMyCertificates() {
    const res = await evaluationApi.get('/certificates/me');
    return res.data;
  },
  async getCertificateByCode(code) {
    const res = await evaluationApi.get(`/certificates/${code}`);
    return res.data;
  },
  getCertificatePdfUrl(id) {
    return `/api/evaluations/certificates/${id}/pdf`;
  },
};

export default evaluationService;