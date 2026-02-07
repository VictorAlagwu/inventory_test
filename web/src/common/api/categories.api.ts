import { client } from '../../api';

export const getCategoriesRequest = () =>
  client.get('/categories');
