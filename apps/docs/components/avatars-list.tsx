"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const avatars = [
  {
    url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Sofia Lindqvist",
  },
  {
    url: "https://images.unsplash.com/photo-1513673054901-2b5f51551112?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Anouk Visser",
  },
  {
    url: "https://images.unsplash.com/photo-1564564244660-5d73c057f2d2?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&sat=-15",
    name: "Mateo Vidal",
  },
  {
    url: "https://images.unsplash.com/photo-1573496527892-904f897eb744?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Amara Okafor",
  },
  {
    url: "https://images.unsplash.com/photo-1631377307475-9acfa929b062?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Zara Delacroix",
  },
  {
    url: "https://images.unsplash.com/photo-1780733057947-7b57f5108f68?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Paulina Nowak",
  },
  {
    url: "https://images.unsplash.com/photo-1750390200282-bf7f669a9946?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Leila Navarro",
  },
  {
    url: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Maya Santoso",
  },
  {
    url: "https://images.unsplash.com/photo-1750390200293-92d5a788d3a2?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Theo Marchetti",
  },
  {
    url: "https://images.unsplash.com/photo-1705645930353-0e335311ef20?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Luca Moretti",
  },
  {
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Marcus Reid",
  },
  {
    url: "https://images.unsplash.com/photo-1604783020105-a1c1a856a55d?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Chidi Eze",
  },
  {
    url: "https://images.unsplash.com/photo-1634149134664-ca3598f29da5?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Emilie Dahl",
  },
  {
    url: "https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&sat=-15",
    name: "Andre Silva",
  },
  {
    url: "https://images.unsplash.com/photo-1692197393247-c76e1bd8f29e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Emir Kaya",
  },
  {
    url: "https://images.unsplash.com/photo-1618568949779-895d81686151?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Declan Murphy",
  },
  {
    url: "https://images.unsplash.com/photo-1752486268240-0507bb1ebc7e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Camille Laurent",
  },
  {
    url: "https://images.unsplash.com/photo-1742518424517-ca7890ff9510?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Rafael Dominguez",
  },
  {
    url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Daniel Hayes",
  },
  {
    url: "https://images.unsplash.com/photo-1509868918748-a554ad25f858?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Isabel Moreau",
  },
  {
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Henrik Bergstrom",
  },
  {
    url: "https://images.unsplash.com/photo-1686063165043-45243dab25ab?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Tomas Almeida",
  },
  {
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Elena Vasquez",
  },
  {
    url: "https://images.unsplash.com/photo-1659128103058-05d3bda8c04f?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Oliver Brandt",
  },
  {
    url: "https://images.unsplash.com/photo-1627161683077-e34782c24d81?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Chiara Rossini",
  },
  {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Nadia Petrova",
  },
  {
    url: "https://images.unsplash.com/photo-1745434159123-4908d0b9df94?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&sat=-15",
    name: "Freya Callahan",
  },
  {
    url: "https://images.unsplash.com/photo-1610631066894-62452ccb927c?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Yasmin Haddad",
  },
  {
    url: "https://images.unsplash.com/photo-1731335213287-d902c76d0ec1?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Linh Truong",
  },
  {
    url: "https://images.unsplash.com/photo-1611608822650-925c227ef4d2?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Jonas Weber",
  },
  {
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Bianca Ferreira",
  },
  {
    url: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Imani Bello",
  },
  {
    url: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Viktor Olsen",
  },
  {
    url: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Casper Holm",
  },
  {
    url: "https://images.unsplash.com/photo-1692643364123-3406d812e384?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Anton Pedersen",
  },
  {
    url: "https://images.unsplash.com/photo-1525457136159-8878648a7ad0?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Diego Ramirez",
  },
  {
    url: "https://images.unsplash.com/photo-1655215993637-5a20b1095d54?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Valentina Costa",
  },
  {
    url: "https://images.unsplash.com/photo-1549473448-b0acc73629dc?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Connor Walsh",
  },
  {
    url: "https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Adaeze Nwosu",
  },
  {
    url: "https://images.unsplash.com/photo-1649705433263-5c80d699b5f5?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100",
    name: "Pascal Girard",
  },
];

const VARIANTS = [
  { key: "default", label: "Default", suffix: "" },
  { key: "neutral", label: "Neutral", suffix: "&bg-remove=true&bg=e5e5e5" },
  { key: "transparent", label: "Transparent", suffix: "&bg-remove=true" },
];

export function AvatarsList() {
  const [copied, setCopied] = useState<string | null>(null);
  const [variant, setVariant] = useState("default");

  const suffix = VARIANTS.find((v) => v.key === variant)?.suffix ?? "";

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(
      () => setCopied((current) => (current === url ? null : current)),
      2000,
    );
  };

  return (
    <>
      <div className="tab-list mt-6 w-fit">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            className={`tab ${variant === v.key ? "active" : ""}`}
            onClick={() => setVariant(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {avatars.map((avatar) => {
          const url = avatar.url + suffix;
          return (
            <button
              key={avatar.url}
              type="button"
              onClick={() => handleCopy(url)}
              className="group cursor-pointer text-left"
              aria-label={`Copy image URL for ${avatar.name}`}
            >
              <div
                className={`relative overflow-hidden rounded-xl border ${
                  variant === "transparent"
                    ? "[background:repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)_0_0/16px_16px]"
                    : ""
                }`}
              >
                <img
                  src={url}
                  alt={avatar.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    copied === url
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="btn btn-sm bg-background text-foreground pointer-events-none">
                    {copied === url ? (
                      <>
                        <Check className="text-green-600" />
                        Copied
                      </>
                    ) : (
                      "Copy URL"
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium">{avatar.name}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
