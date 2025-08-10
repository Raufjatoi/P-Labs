import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";

const TeamSection = () => {
  const team = [
    {
      name: "Muhammad Kamran",
      role: "Team Lead",
      bio: "Mern Full Stack Developer",
      img: "kamran.png",
      github: "",
      mail: "",
      portfolio: ""
    },
    {
      name: "Rauf",
      role: "Developer",
      bio: "Full-stack developer and the core builder of this app.",
      img: "rauf.png",
      github: "https://github.com/Raufjatoi",
      mail: "mailto:raufpokemon00@icloud.com",
      portfolio: "https://raufjatoi.vercel.app"
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-pink-accent/20 to-accent/20">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Meet the Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-3">
            Small, focused team building powerful ML tools — combining research,
            engineering and design to turn ideas into products.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-card border border-border p-6 flex gap-6 items-center 
                         transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]
                         hover:border-purple-400 group"
            >
              {/* Avatar */}
              <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 border border-border">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm text-accent/90 mt-1">{member.role}</p>
                  </div>

                  {/* Icons only if available */}
                  {member.github && member.mail && (
                    <div className="flex items-center gap-2">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent/10"
                        title={`${member.name} on GitHub`}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href={member.mail}
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent/10"
                        title={`Email ${member.name}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mt-3">{member.bio}</p>

                {/* Contact button only for Rauf */}
                {member.name === "Rauf" && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-slate-200"
                      onClick={() =>
                        window.open(member.portfolio, "_blank", "noopener,noreferrer")
                      }
                    >
                      Portfolio
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
