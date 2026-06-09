export type OfficeConfig = {
  subUnit: string
  label: string
  shortLabel: string
  logo: string
  colorClass: string
}

export const OFFICES: OfficeConfig[] = [
  {
    subUnit: "REGIONAL HEADQUARTERS",
    label: "RHQ",
    shortLabel: "RHQ",
    logo: "/logos/PRO4A.png",
    colorClass: "bg-blue-500",
  },
  {
    subUnit: "CAVITE POLICE PROVINCIAL OFFICE",
    label: "Cavite PPO",
    shortLabel: "CV",
    logo: "/logos/cavite-ppo.png",
    colorClass: "bg-emerald-500",
  },
  {
    subUnit: "LAGUNA POLICE PROVINCIAL OFFICE",
    label: "Laguna PPO",
    shortLabel: "LG",
    logo: "/logos/laguna-ppo.png",
    colorClass: "bg-violet-500",
  },
  {
    subUnit: "BATANGAS POLICE PROVINCIAL OFFICE",
    label: "Batangas PPO",
    shortLabel: "BT",
    logo: "/logos/batangas-ppo.png",
    colorClass: "bg-amber-500",
  },
  {
    subUnit: "RIZAL POLICE PROVINCIAL OFFICE",
    label: "Rizal PPO",
    shortLabel: "RZ",
    logo: "/logos/rizal-ppo.png",
    colorClass: "bg-rose-500",
  },
  {
    subUnit: "QUEZON POLICE PROVINCIAL OFFICE",
    label: "Quezon PPO",
    shortLabel: "QZ",
    logo: "/logos/quezon-ppo.png",
    colorClass: "bg-cyan-500",
  },
  {
    subUnit: "REGIONAL MOBILE FORCE BATTALION",
    label: "RMFB4A",
    shortLabel: "RM",
    logo: "/logos/rmfb4a.png",
    colorClass: "bg-orange-500",
  },
]
