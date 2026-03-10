import type { UserService } from "./user.service.js";
import { ApiError, ok } from "../../utils/http.js";
import type { ActionController } from "../../types/express.js";

export class UserController {
  constructor(private readonly userService: UserService) { }

  private toUserDto(user: any) {
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  list: ActionController = async (_req, res) => {
    const users = await this.userService.list();
    res.json({ data: users.map(this.toUserDto) });
  };

  register: ActionController = async (req, res) => {
    const { email, password, role } = req.body;
    const user = await this.userService.register({ email, password, role });
    res.status(201).json(ok(this.toUserDto(user)));
  };

  getById: ActionController = async (req, res) => {
    const userId = req.params.id;
    const user = await this.userService.getById(userId!);
    res.json(ok(this.toUserDto(user)));
  };

  getByEmail: ActionController = async (req, res) => {
    const userEmail = req.params.email;
    const user = await this.userService.getByEmail(userEmail!);
    res.json(ok(this.toUserDto(user)));
  };

  updatePut: ActionController = async (req, res) => {
    const userId = req.params.id;
    const { email, password, role } = req.body;
    const user = await this.userService.updatePut(userId!, {
      email,
      password,
      role,
    });
    res.json(ok(this.toUserDto(user)));
  };

  updatePatch: ActionController = async (req, res) => {
    const userId = req.params.id;

    if (req.auth?.userId !== userId) {
      throw new ApiError(403, { message: "You are not allowed to editing." });
    }

    const { email, password, role } = req.body;
    const user = await this.userService.updatePatch(userId!, {
      email,
      password,
      role,
    });

    res.json(ok(this.toUserDto(user)));
  };

  delete: ActionController = async (req, res) => {
    const userId = req.params.id;
    await this.userService.delete(userId!);
    res.status(204).send();
  };
}
