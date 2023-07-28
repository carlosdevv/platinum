import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameContext } from "@/context/useGameContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type DialogChangeUserProps = {};

const changeUsernameSchema = z.object({
  username: z.string().nonempty("Username obrigatório"),
});

type ChangeUserFormData = z.infer<typeof changeUsernameSchema>;

export function DialogChangeUser({}: DialogChangeUserProps) {
  const { handleSetUsername } = useGameContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeUserFormData>({
    resolver: zodResolver(changeUsernameSchema),
  });

  const onSubmit = (data: ChangeUserFormData) => {
    handleSetUsername(data.username);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Alterar usuário</DialogTitle>
          <DialogDescription>
            Insira seu usuário da PSN para obter seus dados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              {...register("username")}
              id="username"
              placeholder="exemplo: @tikao_lo"
              className="col-span-3"
            />
            {errors?.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Salvar alterações</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
