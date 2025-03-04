export type MenuItensProps = {
  id: number;
  name: string;
  isSelected: boolean;
};

export const menuItens: MenuItensProps[] = [
  {
    id: 1,
    name: "Platinum",
    isSelected: true,
  },
  {
    id: 2,
    name: "PS5",
    isSelected: false,
  },
  {
    id: 3,
    name: "PC",
    isSelected: false,
  },
];
