export type MenuItensProps = {
  id: number;
  name: string;
  isSelected: boolean;
};

export const menuItens: MenuItensProps[] = [
  {
    id: 1,
    name: "Últimos Jogados",
    isSelected: true,
  },
  {
    id: 2,
    name: "Platinados",
    isSelected: false,
  },
];
