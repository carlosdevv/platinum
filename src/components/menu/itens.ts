export type MenuItensProps = {
  id: string;
  name: string;
  isSelected: boolean;
};

export const menuItens: MenuItensProps[] = [
  {
    id: "all",
    name: "All",
    isSelected: true,
  },
  {
    id: "ps5",
    name: "PS5",
    isSelected: false,
  },
  {
    id: "pc",
    name: "PC",
    isSelected: false,
  },
];
