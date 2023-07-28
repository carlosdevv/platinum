"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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

const setUsernameSchema = z.object({
  username: z.string().nonempty("Username obrigatório"),
});

type SetUserFormData = z.infer<typeof setUsernameSchema>;

export function DialogHasUser() {
  const { handleSetUsername, username } = useGameContext();

  const hasUser = username !== "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetUserFormData>({
    resolver: zodResolver(setUsernameSchema),
  });

  const onSubmit = (data: SetUserFormData) => {
    handleSetUsername(data.username);
  };

  return (
    <Dialog open={!hasUser}>
      <DialogContent hasCloseButton={false} className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Insira seu usuário da PSN</DialogTitle>
            <DialogDescription>
              Para iniciar no Platinum, insira seu usuário da PSN para obter
              seus dados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className=" items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                {...register("username")}
                id="username"
                placeholder="ex: tikao_lo"
                className="col-span-3"
              />
              {errors?.username && (
                <span className="w-full text-right text-xs text-red-600">
                  {errors.username.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
