import { SpecFrame } from "@/components/SpecFrame";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";

export function ComponentGallery() {
  return (
    <section id="components" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-[46ch]">
          <h2 className="font-display text-3xl font-medium tracking-tight">
            Twelve parts, one set of rules.
          </h2>
          <p className="mt-4 font-body text-muted">
            Every specimen below shares the same spacing scale, radius, and
            focus behavior — so a button and a switch always feel like they
            came from the same kit.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SpecFrame id="01" name="BUTTON">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Solid</Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
            </div>
          </SpecFrame>

          <SpecFrame id="02" name="INPUT">
            <Input placeholder="Search components…" />
          </SpecFrame>

          <SpecFrame id="03" name="BADGE">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
            </div>
          </SpecFrame>

          <SpecFrame id="04" name="SWITCH">
            <div className="flex items-center gap-3">
              <Switch defaultChecked label="Enable notifications" />
              <span className="font-body text-sm text-ink/70">
                Notifications
              </span>
            </div>
          </SpecFrame>

          <SpecFrame id="05" name="CARD">
            <div className="border border-ink/15 p-4">
              <div className="font-body text-sm font-medium text-ink">
                Weekly digest
              </div>
              <div className="mt-1 font-body text-xs text-ink/55">
                Sent every Monday at 9am
              </div>
            </div>
          </SpecFrame>

          <SpecFrame id="06" name="TABS">
            <div className="flex gap-5 border-b border-ink/15 font-body text-sm">
              <span className="border-b-2 border-accent pb-2 text-ink">
                Overview
              </span>
              <span className="pb-2 text-ink/45">Usage</span>
              <span className="pb-2 text-ink/45">Props</span>
            </div>
          </SpecFrame>
        </div>
      </div>
    </section>
  );
}
