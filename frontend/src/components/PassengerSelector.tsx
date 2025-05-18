import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Minus, Plus, Users } from 'lucide-react';

export function PassengerSelector({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const increase = () => onChange(Math.min(9, value + 1));
    const decrease = () => onChange(Math.max(1, value - 1));

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 text-sm sm:text-base"
                >
                    <Users className="mr-2 h-4 w-4" />
                    {value} hành khách
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
                <div className="flex items-center justify-between">
                    <span>Hành khách</span>
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={decrease}
                            disabled={value <= 1}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span>{value}</span>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={increase}
                            disabled={value >= 9}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
