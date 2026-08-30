import { Metadata } from 'next';
import ExploreContent from './ExploreContent';

export const metadata: Metadata = {
  title: 'Khám phá CloudHost - Hành trình Điện toán đám mây đỉnh cao',
  description: 'Trải nghiệm sức mạnh của cơ sở hạ tầng đám mây không giới hạn. Tối ưu, nhanh chóng, và bảo mật tuyệt đối.',
};

export default function ExplorePage() {
  return <ExploreContent />;
}
