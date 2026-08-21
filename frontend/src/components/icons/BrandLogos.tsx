'use client';

import React from 'react';
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

export function MysqlLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiMysql className={className} style={{ color: '#4479A1' }} />;
}

export function PostgresLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiPostgresql className={className} style={{ color: '#4169E1' }} />;
}

export function RedisLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiRedis className={className} style={{ color: '#FF4438' }} />;
}

export function MongodbLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiMongodb className={className} style={{ color: '#47A248' }} />;
}

export function MinecraftLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <BiCube className={className} style={{ color: '#5C8D37' }} />;
}

export function Cs2Logo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiCounterstrike className={className} style={{ color: '#DE9B35' }} />;
}

export function RustGameLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiRust className={className} style={{ color: '#DEA584' }} />;
}

export function AmdLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiAmd className={className} style={{ color: '#ED1C24' }} />;
}

export function IntelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiIntel className={className} style={{ color: '#0071C5' }} />;
}

export function DellLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiDell className={className} style={{ color: '#007DB8' }} />;
}

export function NginxLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiNginx className={className} style={{ color: '#009639' }} />;
}

export function DockerLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiDocker className={className} style={{ color: '#2496ED' }} />;
}

export function WordpressLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiWordpress className={className} style={{ color: '#21759B' }} />;
}

export function GhostLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiGhost className={className} style={{ color: '#FFFFFF' }} />;
}

export function NextcloudLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiNextcloud className={className} style={{ color: '#0082C9' }} />;
}

export function N8nLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiN8N className={className} style={{ color: '#EA4B71' }} />;
}

export function MinioLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiMinio className={className} style={{ color: '#C72C48' }} />;
}

export function AwsS3Logo({ className = "w-6 h-6" }: { className?: string }) {
  return <FaAws className={className} style={{ color: '#569A31' }} />;
}

export function SectigoLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <IoShieldCheckmarkSharp className={className} style={{ color: '#00D4B2' }} />;
}

export function DigicertLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <IoShieldCheckmarkSharp className={className} style={{ color: '#004380' }} />;
}

export function CpanelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiCpanel className={className} style={{ color: '#FF6C2C' }} />;
}

export function UbuntuLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiUbuntu className={className} style={{ color: '#E95420' }} />;
}

export function DebianLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiDebian className={className} style={{ color: '#A81D33' }} />;
}

export function ProxmoxLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiProxmox className={className} style={{ color: '#E57000' }} />;
}

export function VmwareLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiVmware className={className} style={{ color: '#607078' }} />;
}

export function CloudflareLogo({ className = "w-6 h-6" }: { className?: string }) {
  return <SiCloudflare className={className} style={{ color: '#F38020' }} />;
}
