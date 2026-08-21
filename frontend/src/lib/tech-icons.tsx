'use client';

import React from 'react';
import { IconType } from 'react-icons';
import {
  SiMysql,
  SiPostgresql,
  SiRedis,
  SiMongodb,
  SiSqlite,
  SiMariadb,
  SiDocker,
  SiKubernetes,
  SiNginx,
  SiWordpress,
  SiGhost,
  SiNextcloud,
  SiN8N,
  SiStrapi,
  SiAdminer,
  SiOllama,
  SiMinio,
  SiCloudflare,
  SiCpanel,
  SiPlesk,
  SiLetsencrypt,
  SiUbuntu,
  SiDebian,
  SiProxmox,
  SiVmware,
  SiLinux,
  SiDell,
  SiIntel,
  SiAmd,
  SiRust,
  SiCounterstrike,
  SiDigitalocean,
  SiNodedotjs,
  SiReact,
  SiVuedotjs,
  SiNextdotjs,
  SiHtml5,
  SiCss,
  SiJavascript,
  SiPython,
  SiGo,
  SiPhp,
  SiLaravel,
  SiGit,
  SiGithub,
  SiGitlab,
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa6';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';
import { BiCube } from 'react-icons/bi';

export interface TechMeta {
  id: string;
  name: string;
  Icon: IconType | React.FC<{ className?: string }>;
  brandColor: string;
  category: 'database' | 'os' | 'server' | 'cloud' | 'app' | 'security' | 'game' | 'lang';
}

export const TECH_ICONS_MAP: Record<string, TechMeta> = {
  // Databases
  mysql: { id: 'mysql', name: 'MySQL', Icon: SiMysql, brandColor: '#4479A1', category: 'database' },
  postgresql: { id: 'postgresql', name: 'PostgreSQL', Icon: SiPostgresql, brandColor: '#4169E1', category: 'database' },
  postgres: { id: 'postgres', name: 'PostgreSQL', Icon: SiPostgresql, brandColor: '#4169E1', category: 'database' },
  redis: { id: 'redis', name: 'Redis', Icon: SiRedis, brandColor: '#FF4438', category: 'database' },
  mongodb: { id: 'mongodb', name: 'MongoDB', Icon: SiMongodb, brandColor: '#47A248', category: 'database' },
  sqlite: { id: 'sqlite', name: 'SQLite', Icon: SiSqlite, brandColor: '#003B57', category: 'database' },
  mariadb: { id: 'mariadb', name: 'MariaDB', Icon: SiMariadb, brandColor: '#003545', category: 'database' },

  // Cloud, Infrastructure & Servers
  docker: { id: 'docker', name: 'Docker', Icon: SiDocker, brandColor: '#2496ED', category: 'server' },
  kubernetes: { id: 'kubernetes', name: 'Kubernetes', Icon: SiKubernetes, brandColor: '#326CE5', category: 'server' },
  nginx: { id: 'nginx', name: 'Nginx', Icon: SiNginx, brandColor: '#009639', category: 'server' },
  aws: { id: 'aws', name: 'Amazon Web Services', Icon: FaAws, brandColor: '#FF9900', category: 'cloud' },
  amazons3: { id: 'amazons3', name: 'Amazon S3', Icon: FaAws, brandColor: '#569A31', category: 'cloud' },
  s3: { id: 's3', name: 'Object Storage S3', Icon: FaAws, brandColor: '#569A31', category: 'cloud' },
  minio: { id: 'minio', name: 'MinIO Object Storage', Icon: SiMinio, brandColor: '#C72C48', category: 'cloud' },
  cloudflare: { id: 'cloudflare', name: 'Cloudflare', Icon: SiCloudflare, brandColor: '#F38020', category: 'cloud' },
  digitalocean: { id: 'digitalocean', name: 'DigitalOcean', Icon: SiDigitalocean, brandColor: '#0080FF', category: 'cloud' },
  cpanel: { id: 'cpanel', name: 'cPanel', Icon: SiCpanel, brandColor: '#FF6C2C', category: 'server' },
  plesk: { id: 'plesk', name: 'Plesk', Icon: SiPlesk, brandColor: '#525D65', category: 'server' },

  // Hardware Vendors
  dell: { id: 'dell', name: 'Dell PowerEdge', Icon: SiDell, brandColor: '#007DB8', category: 'server' },
  intel: { id: 'intel', name: 'Intel Xeon', Icon: SiIntel, brandColor: '#0071C5', category: 'server' },
  amd: { id: 'amd', name: 'AMD EPYC & Ryzen', Icon: SiAmd, brandColor: '#ED1C24', category: 'server' },

  // Operating Systems & Hypervisors
  ubuntu: { id: 'ubuntu', name: 'Ubuntu Linux', Icon: SiUbuntu, brandColor: '#E95420', category: 'os' },
  debian: { id: 'debian', name: 'Debian', Icon: SiDebian, brandColor: '#A81D33', category: 'os' },
  proxmox: { id: 'proxmox', name: 'Proxmox VE', Icon: SiProxmox, brandColor: '#E57000', category: 'os' },
  vmware: { id: 'vmware', name: 'VMware ESXi', Icon: SiVmware, brandColor: '#607078', category: 'os' },
  linux: { id: 'linux', name: 'Linux', Icon: SiLinux, brandColor: '#FCC624', category: 'os' },

  // 1-Click Apps & CMS
  wordpress: { id: 'wordpress', name: 'WordPress', Icon: SiWordpress, brandColor: '#21759B', category: 'app' },
  ghost: { id: 'ghost', name: 'Ghost CMS', Icon: SiGhost, brandColor: '#15171A', category: 'app' },
  nextcloud: { id: 'nextcloud', name: 'Nextcloud Hub', Icon: SiNextcloud, brandColor: '#0082C9', category: 'app' },
  n8n: { id: 'n8n', name: 'n8n Automation', Icon: SiN8N, brandColor: '#EA4B71', category: 'app' },
  strapi: { id: 'strapi', name: 'Strapi Headless CMS', Icon: SiStrapi, brandColor: '#4945FF', category: 'app' },
  adminer: { id: 'adminer', name: 'Adminer', Icon: SiAdminer, brandColor: '#F46E26', category: 'app' },
  ollama: { id: 'ollama', name: 'Ollama AI', Icon: SiOllama, brandColor: '#FFFFFF', category: 'app' },

  // Security & SSL
  letsencrypt: { id: 'letsencrypt', name: "Let's Encrypt", Icon: SiLetsencrypt, brandColor: '#003A70', category: 'security' },
  sectigo: { id: 'sectigo', name: 'Sectigo CA', Icon: IoShieldCheckmarkSharp, brandColor: '#00D4B2', category: 'security' },
  digicert: { id: 'digicert', name: 'DigiCert', Icon: IoShieldCheckmarkSharp, brandColor: '#004380', category: 'security' },

  // Gaming
  cs2: { id: 'cs2', name: 'Counter-Strike 2', Icon: SiCounterstrike, brandColor: '#DE9B35', category: 'game' },
  rust: { id: 'rust', name: 'Rust Dedicated', Icon: SiRust, brandColor: '#DEA584', category: 'game' },
  minecraft: { id: 'minecraft', name: 'Minecraft Server', Icon: BiCube, brandColor: '#5C8D37', category: 'game' },

  // Programming Languages & Frameworks
  nodejs: { id: 'nodejs', name: 'Node.js', Icon: SiNodedotjs, brandColor: '#5FA04E', category: 'lang' },
  react: { id: 'react', name: 'React', Icon: SiReact, brandColor: '#61DAFB', category: 'lang' },
  vue: { id: 'vue', name: 'Vue.js', Icon: SiVuedotjs, brandColor: '#4FC08D', category: 'lang' },
  nextjs: { id: 'nextjs', name: 'Next.js', Icon: SiNextdotjs, brandColor: '#000000', category: 'lang' },
  html: { id: 'html', name: 'HTML5', Icon: SiHtml5, brandColor: '#E34F26', category: 'lang' },
  css: { id: 'css', name: 'CSS3', Icon: SiCss, brandColor: '#1572B6', category: 'lang' },
  javascript: { id: 'javascript', name: 'JavaScript', Icon: SiJavascript, brandColor: '#F7DF1E', category: 'lang' },
  python: { id: 'python', name: 'Python', Icon: SiPython, brandColor: '#3776AB', category: 'lang' },
  go: { id: 'go', name: 'Go', Icon: SiGo, brandColor: '#00ADD8', category: 'lang' },
  php: { id: 'php', name: 'PHP', Icon: SiPhp, brandColor: '#777BB4', category: 'lang' },
  laravel: { id: 'laravel', name: 'Laravel', Icon: SiLaravel, brandColor: '#FF2D20', category: 'lang' },
  git: { id: 'git', name: 'Git', Icon: SiGit, brandColor: '#F05032', category: 'lang' },
  github: { id: 'github', name: 'GitHub', Icon: SiGithub, brandColor: '#181717', category: 'lang' },
  gitlab: { id: 'gitlab', name: 'GitLab', Icon: SiGitlab, brandColor: '#FC6D26', category: 'lang' },
};

export interface TechIconProps {
  name: string;
  className?: string;
  size?: number | string;
  color?: string;
  useBrandColor?: boolean;
}

export function TechIcon({
  name,
  className = 'w-6 h-6',
  size,
  color,
  useBrandColor = false,
}: TechIconProps) {
  const normalizedKey = name.toLowerCase().replace(/[\s\-_.]/g, '');
  const tech = TECH_ICONS_MAP[normalizedKey] || Object.values(TECH_ICONS_MAP).find(
    (t) => t.name.toLowerCase() === name.toLowerCase() || t.id === normalizedKey
  );

  if (!tech) {
    return <BiCube className={className} style={{ width: size, height: size, color: color }} />;
  }

  const IconComponent = tech.Icon;
  const finalColor = useBrandColor ? tech.brandColor : color;

  return (
    <IconComponent
      className={className}
      style={{
        width: size,
        height: size,
        color: finalColor,
        fill: finalColor ? 'currentColor' : undefined,
      }}
    />
  );
}

export default TechIcon;
